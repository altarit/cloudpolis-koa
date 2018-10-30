const { HttpError } = require('src/lib/error')
const importService = require('src/services/import/importService')
const importSessionService = require('src/services/import/importSessionService')
const importTreeBuilderService = require('src/services/import/importTreeBuilderService')
const importTreeNormalizationService = require('src/services/import/importTreeNormalizationService')
const importSchemas = require('src/lib/schemas/importSchemas')
const log = require('src/lib/log')(module)

exports.params = {
  name: 'import',
  base: 'manager/',
  roles: 'admin'
}

exports.buildTree = {
  path: 'imports/:sessionId/tree',
  method: 'post',
  description: 'Builds file tree and stores it in the ImportSession.',
  responseSchema: importSchemas.buildTreeResponse.id,
  handler: buildTree
}

async function buildTree (ctx) {
  const { params } = ctx
  const { sessionId } = params

  const fileTree = await importTreeBuilderService.buildImportTree(sessionId)

  ctx.end({
    fileTree
  })
}

exports.confirmSession = {
  path: 'imports/:sessionId/tree/confirm',
  method: 'post',
  description: 'Changes import status from INITIALIZED to READY_TO_PROCESS_METADATA.',
  responseSchema: importSchemas.confirmSessionResponse.id,
  handler: confirmSession
}

async function confirmSession (ctx) {
  const { sessionId } = ctx.params

  const session = await importTreeNormalizationService.confirmSession(sessionId)
  const { status, trackSources, albumSources, compilationSources } = session

  ctx.end({
    status,
    tracks: trackSources,
    albums: albumSources,
    compilations: compilationSources,
  })
}

exports.processMetadata = {
  path: 'imports/:sessionId/metadata',
  method: 'post',
  description: '',
  responseSchema: importSchemas.processMetadataResponse.id,
  handler: processMetadata
}

async function processMetadata (ctx) {
  const { sessionId } = ctx.params

  importService.startImportSession(sessionId)
    .then(res => {
      log.debug(`Import session '%s' has completed`, sessionId)
    })
    .catch(err => {
      log.stackTrace(`Error at import session ${sessionId}`, err)
    })

  ctx.end({
    status: 'PROCESSING_METADATA'
  })
}

exports.checkProgress = {
  path: 'imports/:sessionId/metadata/progress',
  method: 'get',
  description: '',
  responseSchema: importSchemas.checkProgressResponse.id,
  handler: checkProgress
}

async function checkProgress (ctx) {
  const { sessionId } = ctx.params

  const count = await importService.checkProgress(sessionId)

  ctx.end({
    tracksCompleted: count
  })
}

exports.extractTrackSources = {
  path: 'imports/:sessionId/extract',
  method: 'post',
  description: '',
  responseSchema: importSchemas.extractTrackSourcesResponse.id,
  handler: extractTrackSources
}

async function extractTrackSources (ctx) {
  const { sessionId } = ctx.params

  const result = await importService.extractTrackSources(sessionId)

  ctx.end({
    tracksCompleted: result,
  })
}
