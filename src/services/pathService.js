const fs = require('fs')
const path = require('path')
const drivelist = require('drivelist')
const axios = require('axios')

const { HttpError, AuthError } = require('src/lib/error')
const log = require('src/lib/log')(module)

exports.getDir = getDir
exports.checkAvailability = checkAvailability
exports.readDirSeparated = readDirSeparated

async function getDir (mainPath, secondPath) {
  const resultPath = path.resolve(mainPath, secondPath)
  const files = await readDirAsync(resultPath, resultPath)
  const drives = await getDriveList()

  return {
    path: resultPath,
    files: files.filter(file => !file.skip),
    drives: drives
  }
}

async function checkAvailability (importPath, networkPath) {
  let isReadingAvailable = undefined
  let checkedFiles = 0
  let isCreationAvailable = undefined

  const secretWord = `secret_${Date.now()}`
  const filename = `temp_${Date.now()}`
  const tempFilePath = path.resolve(importPath, filename)
  let file

  try {
    file = await createFileAsync(tempFilePath, secretWord)
    log.debug(`Created file '%s'`, tempFilePath)
    //await closeFileAsync(file)
    isCreationAvailable = true

    const uri = networkPath + filename
    log.debug(`Send request '%s' to get '%s' file`, uri, file)
    const response = await axios.get(uri)
    const { data } = response

    if (data === secretWord) {
      isReadingAvailable = true
      checkedFiles++
      log.debug(`Successfully checked.`)
    } else {
      throw new Error(`Secret word '${data}' in response doesn't equal the one '${secretWord}' in the file. `)
    }
  } catch (err) {
    log.stackTrace(`Error at checking availability ${tempFilePath}`, err)
  } finally {
    if (file) {
      await removeFileAsync(tempFilePath)
      log.debug(`Removed file '%s'`, tempFilePath)
    }
  }

  return {
    importPath: importPath,
    networkPath: networkPath,
    isReadingAvailable: isReadingAvailable,
    checkedFiles: checkedFiles,
    isCreationAvailable: isCreationAvailable,
  }
}

async function createFileAsync (filePath, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, (err, fd) => {
      if (err) {
        reject(err)
        return
      }
      resolve(filePath)
    })
  })
}

async function closeFileAsync (fileDescriptor) {
  return new Promise((resolve, reject) => {
    fileDescriptor.close(err => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}


async function removeFileAsync (filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}


async function getDirFilesPaths (directoryPath) {
  return await new Promise((resolve, reject) => {
    fs.readdir(directoryPath, {}, (err, files) => {
      if (err) {
        return reject(err)
      }
      return resolve(files)
    })
  })
}

async function readDirAsync (directoryPath, rootPath) {
  const filesPaths = await getDirFilesPaths(directoryPath)
  return await Promise.all(filesPaths.map(fileName => getFileStat(path.resolve(directoryPath, fileName), rootPath)))
}

async function getFileStat (filePath, rootPath) {
  return new Promise((resolve, reject) => {
    const name = path.basename(filePath)
    const ext = path.extname(filePath)
    const resultPath = rootPath ? path.relative(rootPath, filePath) : filePath

    fs.stat(filePath, {}, (err, stat) => {
      if (err || filePath[0] === '.') {
        return resolve({
          name: name,
          ext: ext,
          path: resultPath,
          skip: true,
        })
      }
      return resolve({
        name: name,
        ext: ext,
        path: resultPath,
        isDir: stat.isDirectory(),
        size: stat.size,
      })
    })
  })
}

async function getDriveList () {
  return new Promise((resolve, reject) => {
    drivelist.list((err, drives) => {
      if (err) {
        return reject(err)
      }

      const result = []

      for (const drive of drives) {
        const { mountpoints } = drive

        for (const mountpoint of mountpoints) {
          result.push({
            mountpoint: mountpoint.path
          })
        }
      }

      return resolve(result)
    })
  })
}

async function readDirSeparated (directoryPath, rootPath) {
  const directories = []
  const files = []
  const allObjects = await readDirAsync(path.resolve(rootPath, directoryPath), rootPath)

  for (const file of allObjects) {
    if (file.isDir) {
      directories.push({
        name: file.name,
        path: file.path,
      })
    } else {
      files.push({
        name: file.name,
        ext: file.ext,
        size: file.size,
        path: file.path,
      })
    }
  }

  return { directories, files }
}
