const { NotFoundError } = require('src/lib/error/index')
const { Library, ImportSession } = require('src/models/index')
const {getIdString} = require('src/lib/mongoose')
const log = require('src/lib/log')(module)

module.exports.getImportSessionsByLibraryName = getImportSessionsByLibraryName
module.exports.getImportSessionByName = getImportSessionByName
module.exports.createImportSession = createImportSession

async function getImportSessionsByLibraryName (libraryName) {
  return await ImportSession
    .find({ library: libraryName }, {
      _id: 0,
      name: 1,
      library: 1,
      importPath: 1,
      networkPath: 1,
      status: 1,
      created: 1,
    })
    .sort({ created: 1 })
    .exec()
}

async function getImportSessionByName (sessionName) {
  return await ImportSession.findOne({ name: sessionName }, {
    _id: 0,
    name: 1,
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
    name: 'm' + Date.now(),
    library: libraryName,
    importPath,
    networkPath,
    status: 'INITIALIZED',
  })
  await session.save()

  return session.name
}
