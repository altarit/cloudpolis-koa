const pathService = require('src/services/pathService')
const pathSchemas = require('src/lib/schemas/pathSchemas')
const log = require('src/lib/log')(module)

exports.params = {
  name: 'path',
  base: 'path/'
}

exports.getDir = {
  path: 'dir',
  method: 'post',
  description: 'Provides file system navigation.',
  requestSchema: pathSchemas.getDirRequest.id,
  responseSchema: pathSchemas.getDirResponse.id,
  roles: 'admin',
  handler: getDir
}

async function getDir (ctx) {
  const { mainPath = __dirname, additionalPath = '.' } = ctx.request.body

  const result = await pathService.getDir(mainPath, additionalPath)

  ctx.end({
    path: result.path,
    files: result.files,
    drives: result.drives
  })
}

exports.checkAvailability = {
  path: 'availability',
  method: 'post',
  description: 'Checks whether files in {importPath} directory can be accessed with {networkPath} uri.',
  requestSchema: pathSchemas.checkAvailabilityRequest.id,
  responseSchema: pathSchemas.checkAvailabilityResponse.id,
  roles: 'admin',
  handler: checkAvailability
}

async function checkAvailability (ctx) {
  const { importPath, networkPath } = ctx.request.body

  const result = await pathService.checkAvailability(importPath, networkPath)

  ctx.end(result)
}
