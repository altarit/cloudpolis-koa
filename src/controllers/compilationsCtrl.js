const { HttpError, NotFoundError } = require('src/lib/error')
const musicService = require('src/services/musicService')
const compilationsSchemas = require('src/lib/schemas/compilationsSchemas')
const log = require('src/lib/log')(module)

exports.params = {
  name: 'compilations',
  base: 'music/artists/'
}

exports.getCompilationsList = {
  path: '',
  method: 'get',
  description: '',
  responseSchema: compilationsSchemas.getCompilationsListResponse.id,
  handler: getCompilationsList
}

async function getCompilationsList (ctx) {
  const artists = await musicService.getAllArtists()

  ctx.end({
    artists
  })
}

exports.getCompilationByName = {
  path: ':libraryName/:compilationName',
  method: 'get',
  description: '',
  responseSchema: compilationsSchemas.getCompilationByNameResponse.id,
  handler: getCompilationByName
}

async function getCompilationByName (ctx) {
  const {libraryName, compilationName} = ctx.params

  const artist = await musicService.getArtistByName(libraryName, compilationName)
  if (!artist) {
    throw new NotFoundError(`Compilation ${libraryName}/${compilationName} not found.`)
  }

  ctx.end({
    artist
  })
}
