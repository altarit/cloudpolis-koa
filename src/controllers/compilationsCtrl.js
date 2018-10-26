const { HttpError } = require('src/lib/error/index')
const musicService = require('src/services/musicService')

const log = require('src/lib/log')(module)



exports.artists = artists
exports.getArtistByName = getArtistByName

async function artists (ctx) {
  let artists = await musicService.getAllArtists()
  ctx.body = { data: artists }
}

async function getArtistByName (ctx) {
  console.log('id: ' + ctx.params.library + '/' + ctx.params.name)
  let artist = await musicService.getArtistByName(ctx.params.library, ctx.params.name)
  if (artist) {
    ctx.body = {
      data: {
        artist: artist
      }
    }
  } else {
    throw new HttpError(404, 'Artist not found')
  }
}
