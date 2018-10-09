const fs = require('fs')
const path = require('path')
const drivelist = require('drivelist')

const { HttpError, AuthError } = require('src/lib/error')
const log = require('src/lib/log')(module)

exports.getDir = getDir

async function getDir (ctx) {
  const { mainPath = __dirname, secondPath = '.' } = ctx.request.body

  const resultPath = path.resolve(mainPath, secondPath)
  const files = await readDirAsync(resultPath)
  const drives = await getDriveList()

  ctx.body = {
    data: {
      path: resultPath,
      files: files,
      drives: drives
    }
  }
}

async function readDirAsync (directory) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, {}, (err, files) => {
      if (err) {
        return reject(err)
      }
      return resolve(files)
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

        for(const mountpoint of mountpoints) {
          result.push({
            mountpoint: mountpoint.path
          })
        }
      }

      return resolve(result)
    })
  })
}
