const fs = require('fs').promises
const path = require('path')
const drivelist = require('drivelist')
const axios = require('axios')

const { HttpError, AuthError } = require('src/lib/error')
const log = require('src/lib/log')(module)

exports.getDir = getDir
exports.checkAvailability = checkAvailability
exports.readDirSeparated = readDirSeparated

/**
 *
 * @param {string} mainPath       Main path to a directory.
 * @param {string} additionalPath Additional relative path for the mainPath param.
 */
async function getDir (mainPath, additionalPath) {
  const resultPath = path.resolve(mainPath, additionalPath)
  const files = await readDirAsync(resultPath, resultPath)
  const drives = await getDriveList()

  return {
    path: resultPath,
    files: files,
    drives: drives
  }
}

/**
 *
 * @param {string} importPath   Full path to a directory.
 * @param {string} networkPath  Uri to the server that provides static files.
 */
async function checkAvailability (importPath, networkPath) {
  let isReadingAvailable = undefined
  let isCreationAvailable = undefined
  let checkedFiles = 0

  const secretWord = `secret_${Date.now()}`
  const filename = `temp_${Date.now()}`
  const tempFilePath = path.resolve(importPath, filename)
  let file

  try {
    file = await fs.writeFile(tempFilePath, secretWord)
    log.debug(`Created file '%s'`, tempFilePath)
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
      await fs.unlink(tempFilePath)
      log.debug(`Removed file '%s'`, tempFilePath)
    }
  }

  return {
    isReadingAvailable: isReadingAvailable,
    isCreationAvailable: isCreationAvailable,
    checkedFiles: checkedFiles,
  }
}

async function readDirAsync (directoryPath, rootPath) {
  const filesPaths = await fs.readdir(directoryPath)
  return await Promise.all(filesPaths.map(fileName => getFileStat(path.resolve(directoryPath, fileName), rootPath)))
    .then(elements => elements.filter(el => el && !el.skip))
}

async function getFileStat (filePath, rootPath) {
  if (filePath[0] === '.') {
    return null
  }

  const name = path.basename(filePath)
  const ext = path.extname(filePath)
  const resultPath = rootPath ? path.relative(rootPath, filePath) : filePath

  try {
    const stat = await fs.stat(filePath, {})
    return {
      name: name,
      ext: ext,
      path: resultPath,
      isDir: stat.isDirectory(),
      size: stat.size,
    }
  } catch (e) {
    log.warn(`Error at reading stats of '%s'`, filePath)
    return {
      name: name,
      ext: ext,
      path: resultPath,
      skip: true,
    }
  }
}

/**
 *  Returns array of disk drives with mount oints.
 */
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
  const nextDirectoryPath = path.resolve(rootPath, directoryPath)
  const allObjects = await readDirAsync(nextDirectoryPath, rootPath)

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
