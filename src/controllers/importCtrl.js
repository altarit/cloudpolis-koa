const fs = require('fs')
const path = require('path')

const importService = require('src/services/importService')

const { HttpError, AuthError } = require('src/lib/error/index')
const log = require('src/lib/log')(module)

exports.prepareImportSession = prepareImportSession
exports.checkProgress = checkProgress
exports.extractTrackSources = extractTrackSources
exports.getImportSessionsByLibraryName = getImportSessionsByLibraryName
exports.getImportSessionByName = getImportSessionByName
exports.getTree = getTree
exports.confirmSession = confirmSession

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

async function prepareImportSession (ctx) {
  const libraryName = ctx.params.libraryName
  const { mainPath, networkPath } = ctx.request.body

  const result = await importService.prepareImportSession(libraryName, mainPath, networkPath)

  ctx.body = {
    data: {
      importSessionId: result
    }
  }
}

async function getTree (ctx) {
  const sessionName = ctx.params.sessionName
  const { mainPath, networkPath, libraryName } = ctx.request.body

  const result = await importService.buildImportTree(sessionName, libraryName, mainPath, networkPath)

  ctx.body = {
    data: result
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
