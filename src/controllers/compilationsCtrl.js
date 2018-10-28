const { HttpError, NotFoundError } = require('src/lib/error')
const musicService = require('src/services/musicService')
const log = require('src/lib/log')(module)

exports.params = {
  base: 'music/artists/'
}

exports.getCompilationsList = {
  path: '',
  description: '',
  requestSchema: {},
  method: 'get',
  responseSchema: {
    properties: {
      artists: {
        type: 'array',
        items: {
          type: 'object',
        },
      },
    },
    required: ['artists']
  },
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
  description: '',
  requestSchema: {},
  method: 'get',
  responseSchema: {
    properties: {
      artists: {
        type: 'object',
      },
    },
    required: ['artist']
  },
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
