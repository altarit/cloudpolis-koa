const { HttpError } = require('src/lib/error/index')
const importService = require('src/services/import/importService')
const importSessionService = require('src/services/import/importSessionService')
const importTreeBuilderService = require('src/services/import/importTreeBuilderService')
const importTreeNormalizationService = require('src/services/import/importTreeNormalizationService')
const log = require('src/lib/log')(module)

exports.params = {
  name: 'import',
  base: 'manager/',
  roles: 'admin'
}

exports.buildTree = {
  path: 'imports/:sessionName/tree',
  description: 'Builds file tree and stores it in the ImportSession.',
  requestSchema: {},
  method: 'post',
  responseSchema: {
    properties: {
      fileTree: {
        type: 'object',
      },
    },
    required: ['fileTree']
  },
  handler: buildTree
}

async function buildTree (ctx) {
  const { params } = ctx
  const { sessionName } = params

  const fileTree = await importTreeBuilderService.buildImportTree(sessionName)

  ctx.end({
    fileTree
  })
}

exports.confirmSession = {
  path: 'imports/:sessionName/tree/confirm',
  description: 'Changes import status from INITIALIZED to READY_TO_PROCESS_METADATA.',
  requestSchema: {},
  method: 'post',
  responseSchema: {
    properties: {
      status: {
        type: 'string'
      },
      tracks: {
        type: 'array'
      },
      albums: {
        type: 'array'
      },
      compilations: {
        type: 'array'
      },
    },
    required: ['status', 'tracks', 'albums', 'compilations']
  },
  handler: confirmSession
}

async function confirmSession (ctx) {
  const { sessionName } = ctx.params

  const session = await importTreeNormalizationService.confirmSession(sessionName)
  const { status, trackSources, albumSources, compilationSources } = session

  ctx.end({
    status,
    tracks: trackSources,
    albums: albumSources,
    compilations: compilationSources,
  })
}

exports.processMetadata = {
  path: 'imports/:sessionName/metadata',
  description: '',
  requestSchema: {},
  method: 'post',
  responseSchema: {
    properties: {
      status: {
        type: 'string'
      },
    },
    required: ['status']
  },
  handler: processMetadata
}

async function processMetadata (ctx) {
  const { sessionName } = ctx.params

  importService.startImportSession(sessionName)
    .then(res => {
      log.debug(`Import session '%s' has completed`, sessionName)
    })
    .catch(err => {
      log.stackTrace(`Error at import session ${sessionName}`, err)
    })

  ctx.end({
    status: 'PROCESSING_METADATA'
  })
}

exports.checkProgress = {
  path: 'imports/:sessionName/metadata/progress',
  description: '',
  requestSchema: {},
  method: 'get',
  responseSchema: {
    properties: {
      tracksCompleted: {
        type: 'number'
      },
    },
    required: ['tracksCompleted']
  },
  handler: checkProgress
}

async function checkProgress (ctx) {
  const { sessionName } = ctx.params

  const count = await importService.checkProgress(sessionName)

  ctx.end({
    tracksCompleted: count
  })
}

exports.extractTrackSources = {
  path: 'imports/:sessionName/extract',
  description: '',
  requestSchema: {},
  method: 'post',
  responseSchema: {
    properties: {
      tracksCompleted: {
        type: 'number'
      },
    },
    required: ['tracksCompleted']
  },
  handler: extractTrackSources
}

async function extractTrackSources (ctx) {
  const { sessionName } = ctx.params

  const result = await importService.extractTrackSources(sessionName)

  ctx.end({
    tracksCompleted: result,
  })
}
