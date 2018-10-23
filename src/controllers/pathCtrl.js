const pathService = require('src/services/pathService')
const log = require('src/lib/log')(module)

exports.params = {
  base: 'path/'
}

exports.getDir = {
  path: 'dir',
  schema: {
    'mainPath': {
      'type': 'string'
    },
    'secondPath': {
      'type': 'string'
    }
  },
  required: ['mainPath'],
  method: 'post',
  handler: getDir
}

/**
 * Provides file system navigation.
 *
 * @bodyParam mainPath    string - full path to the directory
 * @bodyParam secondPath  string - relative path for mainPath parameter. Optional
 * @response  path        string - full path to the directory
 * @response  files       arrayOf() - files and directories contained in the directory
 * @response  drives      arrayOf({name:string}) - available disk drives and mount points
 */
async function getDir (ctx) {
  const { mainPath = __dirname, secondPath = '.' } = ctx.request.body

  const result = await pathService.getDir(mainPath, secondPath)

  ctx.body = {
    data: {
      path: result.path,
      files: result.files,
      drives: result.drives
    }
  }
}

exports.checkAvailability = {
  path: 'availability',
  schema: {
    'importPath': {
      'type': 'string'
    },
    'networkPath': {
      'type': 'string'
    }
  },
  required: ['importPath', 'networkPath'],
  method: 'post',
  handler: checkAvailability
}

/**
 * Checks either files in {importPath} directory can be accessed with {networkPath} uri
 *
 * @bodyParam importPath  full path to a directory
 * @bodyParam networkPath uri to the server that provides static files
 * @response  result      results
 */
async function checkAvailability (ctx) {
  const { importPath = __dirname, networkPath } = ctx.request.body

  const result = await pathService.checkAvailability(importPath, networkPath)

  ctx.body = {
    data: result
  }
}
