const { NotFoundError } = require('src/lib/error')
const librariesService = require('src/services/librariesService')
const librariesSchemas = require('src/lib/schemas/librariesSchemas')
const log = require('src/lib/log')(module)

exports.params = {
  name: 'libraries',
  base: 'music/libraries/'
}

exports.getLibrariesList = {
  path: '',
  description: 'Returns all libraries.',
  requestSchema: {},
  method: 'get',
  responseSchema: librariesSchemas.getLibrariesListResponse.id,
  handler: getLibrariesList
}

async function getLibrariesList (ctx) {
  const libraries = await librariesService.getAllLibraries()

  ctx.end({
    libraries
  })
}

exports.getLibraryDetails = {
  path: ':libraryName',
  description: 'Returns library by name.',
  requestSchema: {},
  method: 'get',
  responseSchema: librariesSchemas.getLibraryDetailsResponse.id,
  handler: getLibraryDetails
}

async function getLibraryDetails (ctx) {
  const { libraryName } = ctx.params

  const library = await librariesService.getLibraryDetails(libraryName)
  if (!library) {
    throw new NotFoundError(`Library ${libraryName} not found.`)
  }

  ctx.end({
    library
  })
}

exports.createLibrary = {
  path: '',
  description: 'Create a library.',
  requestSchema: librariesSchemas.createLibraryRequest,
  method: 'post',
  roles: 'admin',
  responseSchema: {},
  handler: createLibrary
}

async function createLibrary (ctx) {
  const { name } = ctx.request.body

  const library = await librariesService.createLibrary(name)

  ctx.end({ library })
}

exports.deleteLibrary = {
  path: ':libraryName',
  description: 'Delete library.',
  requestSchema: {},
  method: 'delete',
  roles: 'admin',
  responseSchema: {},
  handler: deleteLibrary
}

async function deleteLibrary (ctx) {
  const { libraryName } = ctx.params

  const result = librariesService.deleteLibrary(libraryName)

  ctx.end(result)
}
