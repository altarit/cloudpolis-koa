const { HttpError } = require('src/lib/error/index')
const musicService = require('src/services/musicService')

const log = require('src/lib/log')(module)

exports.libraries = libraries
exports.libraryDetails = libraryDetails
exports.createLibrary = createLibrary
exports.deleteLibrary = deleteLibrary


async function libraries (ctx) {
  const libraries = await musicService.getAllLibraries()
  ctx.body = {
    data: libraries
  }
}

async function libraryDetails (ctx) {
  const libraryName = ctx.params.libraryName
  const compilations = await musicService.getCompilationsByLibraryName(libraryName)
  ctx.body = {
    data: compilations
  }
}

async function createLibrary (ctx) {
  const libraryName = ctx.request.body.name
  if (!libraryName) {
    log.debug('Parameter name is missed')
    throw new Error('Parameter name is missed')
  }
  let library = await musicService.createLibrary(libraryName)
  ctx.body = {}
}

async function deleteLibrary (ctx) {
  let libraryName = ctx.params.libraryName
  let result = musicService.deleteLibrary(libraryName)
  ctx.body = {}
}
