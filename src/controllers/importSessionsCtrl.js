const { NotFoundError } = require('src/lib/error')
const importService = require('src/services/import/importService')
const importSessionService = require('src/services/import/importSessionService')
const importSessionsSchema = require('src/lib/schemas/importSessionsSchema')
const log = require('src/lib/log')(module)

exports.params = {
  name: 'importSessions',
  base: 'manager/',
  roles: 'admin'
}

exports.createImportSession = {
  path: 'libraries/:libraryName/import/sessions',
  method: 'post',
  description: 'Creates new INITIALIZED ImportSession.',
  requestSchema: importSessionsSchema.createImportSessionRequest.id,
  responseSchema: importSessionsSchema.createImportSessionResponse.id,
  handler: createImportSession
}

async function createImportSession (ctx) {
  const { params, request } = ctx
  const { libraryName } = params
  const { importPath, networkPath } = request.body

  const sessionId = await importSessionService.createImportSession(libraryName, importPath, networkPath)

  ctx.end({
    importSessionId: sessionId
  })
}

exports.getImportSessionsByLibraryName = {
  path: 'libraries/:libraryName/import/sessions',
  method: 'get',
  description: 'Get all import sessions in specified library.',
  responseSchema: importSessionsSchema.getImportSessionsByLibraryNameResponse.id,
  handler: getImportSessionsByLibraryName
}

async function getImportSessionsByLibraryName (ctx) {
  const { libraryName } = ctx.params

  const sessions = await importSessionService.getImportSessionsByLibraryName(libraryName)

  ctx.end({
    sessions
  })
}

exports.getImportSessionByName = {
  path: 'imports/:sessionId',
  method: 'get',
  description: 'Get import sessions by name.',
  responseSchema: importSessionsSchema.getImportSessionByNameResponse.id,
  handler: getImportSessionByName
}

async function getImportSessionByName (ctx) {
  const { sessionId } = ctx.params

  const session = await importSessionService.getImportSessionByName(sessionId)
  if (!session) {
    throw new NotFoundError(`Session ${sessionId} not found.`)
  }

  ctx.end({
    session
  })
}
