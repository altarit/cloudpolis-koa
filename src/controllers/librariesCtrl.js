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
  method: 'get',
  description: 'Returns all libraries.',
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
  method: 'get',
  description: 'Returns library by name.',
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
  method: 'post',
  description: 'Create a library.',
  requestSchema: librariesSchemas.createLibraryRequest.id,
  roles: 'admin',
  handler: createLibrary
}

async function createLibrary (ctx) {
  const { name } = ctx.request.body

  const library = await librariesService.createLibrary(name)

  ctx.end({ library })
}

exports.deleteLibrary = {
  path: ':libraryName',
  method: 'delete',
  description: 'Delete library.',
  roles: 'admin',
  handler: deleteLibrary
}

async function deleteLibrary (ctx) {
  const { libraryName } = ctx.params

  const result = librariesService.deleteLibrary(libraryName)

  ctx.end(result)
}
