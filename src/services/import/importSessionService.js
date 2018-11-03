const { NotFoundError } = require('src/lib/error')
const { Library, ImportSession } = require('src/models')
const { IMPORT_STATUSES } = ImportSession
const { getIdString } = require('src/lib/mongoose')
const log = require('src/lib/log')(module)

module.exports.getImportSessionsByLibraryName = getImportSessionsByLibraryName
module.exports.getImportSessionByName = getImportSessionByName
module.exports.createImportSession = createImportSession
module.exports.deleteImportSession = deleteImportSession
module.exports.forceChangeStatus = forceChangeStatus

async function getImportSessionsByLibraryName (libraryName) {
  return await ImportSession
    .find({ library: libraryName }, {
      _id: 0,
      id: 1,
      library: 1,
      importPath: 1,
      networkPath: 1,
      status: 1,
      created: 1,
    })
    .sort({ created: 1 })
    .exec()
}

async function getImportSessionByName (sessionId) {
  return await ImportSession.findOne({ id: sessionId }, {
    _id: 0,
    id: 1,
    library: 1,
    importPath: 1,
    networkPath: 1,
    status: 1,
    created: 1,
    fileTree: 1,
  })
}

async function createImportSession (libraryName, importPath, networkPath) {
  const library = await Library.findOne({ name: libraryName })
  if (!library) {
    throw new NotFoundError(`Library ${libraryName} not found.`)
  }

  const id = getIdString()
  log.debug(`Create session with id=%s`, id)

  const session = new ImportSession({
    id: id,
    library: libraryName,
    importPath,
    networkPath,
    status: IMPORT_STATUSES.INITIALIZED,
  })
  await session.save()

  return session.id
}

async function deleteImportSession (sessionId, sessionStatus) {
  const session = await ImportSession.findOne({ id: sessionId })
  if (!session) {
    throw new NotFoundError(`Session ${sessionId} not found.`)
  }

  const { id, status } = session

  if (status !== sessionStatus) {
    throw new Error(`Expected session status: ${sessionStatus}. Actual: ${status}.`)
  }
  if (status === IMPORT_STATUSES.COMPLETED) {
    throw new Error(`Doesn't support deleting ${IMPORT_STATUSES.COMPLETED} sessions. Change the status first.`)
  }
  // if (status === IMPORT_STATUSES.PROCESSING_METADATA) {
  //   throw new Error(`Doesn't support deleting ${IMPORT_STATUSES.PROCESSING_METADATA} session. Change the status first.`)
  // }

  await session.delete()

  return {
    ok: true
  }
}

async function forceChangeStatus (sessionId, sessionStatus) {
  const session = await ImportSession.findOne({ id: sessionId })
  if (!session) {
    throw new NotFoundError(`Session ${sessionId} not found.`)
  }

  const newStatus = IMPORT_STATUSES[sessionStatus]
  if (!newStatus) {
    throw new Error(`Status ${sessionStatus} is not valid.`)
  }

  session.status = newStatus
  await session.save()

  return session
}
