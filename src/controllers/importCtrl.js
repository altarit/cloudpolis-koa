const fs = require('fs')
const path = require('path')

const { HttpError, AuthError } = require('src/lib/error')
const importService = require('src/services/importService')
const log = require('src/lib/log')(module)

exports.checkProgress = checkProgress
exports.extractTrackSources = extractTrackSources
exports.getImportSessionsByLibraryName = getImportSessionsByLibraryName
exports.getImportSessionByName = getImportSessionByName
exports.getTree = getTree
exports.confirmSession = confirmSession

exports.params = {
  base: 'manager/'
}

exports.createImportSession = {
  path: 'libraries/:libraryName/import/sessions',
  description: 'Creates new INITIALIZED ImportSession.',
  requestSchema: {
    properties: {
      mainPath: {
        type: 'string',
        description: 'Full path to the import directory.'
      },
      networkPath: {
        type: 'string',
        description: 'Network path that provides files from {mainPath}.'
      }
    },
    required: ['mainPath', 'networkPath']
  },
  method: 'post',
  responseSchema: {
    properties: {
      importSessionId: {
        type: 'string',
        description: 'Id of created ImportSession.'
      },
    },
    required: ['importSessionId']
  },
  handler: createImportSession
}

async function createImportSession (ctx) {
  const { params, request } = ctx
  const { libraryName } = params
  const { mainPath, networkPath } = request.body

  const result = await importService.createImportSession(libraryName, mainPath, networkPath)

  ctx.end({
    importSessionId: result
  })
}


exports.getTree = {
  path: 'imports/:sessionName/tree',
  description: 'Builds file tree and stores it in the ImportSession.',
  requestSchema: {
  },
  method: 'post',
  responseSchema: {
    properties: {
      importSessionId: {
        type: 'string',
        description: 'Id of created ImportSession.'
      },
    },
    required: ['importSessionId']
  },
  handler: getTree
}


async function getTree (ctx) {
  const { params } = ctx
  const { sessionName } = params

  const result = await importService.buildImportTree(sessionName)

  ctx.end(result)
}


async function checkProgress (ctx) {
  const sessionName = ctx.params.sessionName

  const count = await importService.checkProgress(sessionName)

  ctx.body = {
    data: {
      tracksCompleted: count
    }
  }
}

async function extractTrackSources (ctx) {
  const sessionName = ctx.params.sessionName

  const result = await importService.extractTrackSources(sessionName)

  ctx.body = {
    data: {
      tracksCompleted: result,
    }
  }
}


async function confirmSession (ctx) {
  const sessionName = ctx.params.sessionName

  const session = await importService.confirmSession(sessionName)
  const { importPath, library, networkPath, status, trackSources, albumSources, compilationSources } = session

  importService.startImportSession(sessionName, importPath, trackSources, albumSources, compilationSources, library, networkPath, session)
    .then(res => {
      log.debug(`Import session '%s' has completed`, sessionName)
    })
    .catch(err => {
      log.stackTrace(`Error at import session ${sessionName}`, err)
    })

  ctx.body = {
    data: {
      status,
      tracks: trackSources,
      albums: albumSources,
      compilations: compilationSources,
    }
  }
}


async function getImportSessionsByLibraryName (ctx) {
  const libraryName = ctx.params.libraryName

  const result = await importService.getImportSessionsByLibraryName(libraryName)

  ctx.body = {
    data: {
      sessions: result
    }
  }
}

async function getImportSessionByName (ctx) {
  const sessionName = ctx.params.sessionName

  const result = await importService.getImportSessionByName(sessionName)

  ctx.body = {
    data: {
      session: result
    }
  }
}
