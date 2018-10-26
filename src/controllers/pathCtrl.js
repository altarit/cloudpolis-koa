const pathService = require('src/services/pathService')
const log = require('src/lib/log')(module)

exports.params = {
  base: 'path/'
}

exports.getDir = {
  path: 'dir',
  requestSchema: {
    properties: {
      'mainPath': {
        'type': 'string'
      },
      'secondPath': {
        'type': 'string'
      }
    },
    required: ['mainPath']
  },
  method: 'post',
  responseSchema: {},
  handler: getDir
}

/**
 * Provides file system navigation.
 *
 * @bodyParam mainPath    full path to the directory.
 * @bodyParam secondPath  relative path for {mainPath} parameter. Optional.
 * @response  path        full path to the directory.
 * @response  files       files and directories contained in the directory.
 * @response  drives      available disk drives and mount points.
 */
async function getDir (ctx) {
  const { mainPath = __dirname, secondPath = '.' } = ctx.request.body

  const result = await pathService.getDir(mainPath, secondPath)

  ctx.end({
    path: result.path,
    files: result.files,
    drives: result.drives
  })
}

exports.checkAvailability = {
  path: 'availability',
  requestSchema: {
    properties: {
      'importPath': {
        'type': 'string'
      },
      'networkPath': {
        'type': 'string'
      }
    },
    required: ['importPath', 'networkPath']
  },
  method: 'post',
  handler: checkAvailability
}

/**
 * Checks either files in {importPath} directory can be accessed with {networkPath} uri.
 *
 * @bodyParam importPath  full path to a directory.
 * @bodyParam networkPath uri to the server that provides static files.
 * @response  result      results.
 */
async function checkAvailability (ctx) {
  const { importPath = __dirname, networkPath } = ctx.request.body

  const result = await pathService.checkAvailability(importPath, networkPath)

  ctx.end(result)
}
