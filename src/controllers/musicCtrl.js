const { HttpError } = require('src/lib/error/index')
const musicService = require('src/services/musicService')
const log = require('src/lib/log')(module)

exports.index = index
exports.libraries = libraries
exports.libraryDetails = libraryDetails
exports.createLibrary = createLibrary
exports.deleteLibrary = deleteLibrary
exports.artists = artists
exports.getArtistByName = getArtistByName

exports.search = search
exports.random = random
exports.bySrc = bySrc
exports.getTrackInfo = getTrackInfo
exports.setTrackInfo = setTrackInfo
exports.addToStat = addToStat
exports.addSingleStat = addSingleStat

async function index (ctx) {
  ctx.body = {
    data: {
      api: {
        artists: '/api/music/artists',
        artistsDetail: '/api/music/artists/:id',
        random: 'api/music/random'
      }
    }
  }
}

/* ------------------------------ */
/*           libraries            */
/* ------------------------------ */

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

/* ------------------------------ */
/*            artists             */
/* ------------------------------ */

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

/* ------------------------------ */
/*             tracks             */
/* ------------------------------ */

async function search (ctx) {
  let query = ctx.request.query.query
  const filteredSongs = await musicService.searchTracksByQuery(query)
  ctx.body = { data: filteredSongs }
}

async function random (ctx) {
  let n = 15
  let filter = ctx.request.query.filter
  let condition = filter ? JSON.parse(filter) : { "library": { "$in": ["mlpost"] } }

  let result = await musicService.random(condition, 20)
  ctx.body = { data: result }
  ctx.request.isLogNeeded = true
}

async function getTrackInfo (ctx) {
  let trackId = ctx.params.trackId
  let trackInfo = await musicService.getTrackInfo(trackId)
  ctx.body = { data: trackInfo || {} }
}

async function bySrc (ctx) {
  let href = ctx.request.query.href
  const song = await musicService.searchTrackByHref(href)
  ctx.body = { data: song }
  ctx.request.isLogNeeded = true
}

async function addSingleStat (ctx) {
  ctx.body = {}
}

async function setTrackInfo (ctx) {
  let trackId = ctx.params.trackId
  let lyrics = ctx.request.body.lyrics
  let updated = await musicService.setTrackInfo(trackId, lyrics)
  ctx.body = { result: 'ok' }
}

async function addToStat (ctx) {
  let title = ctx.request.query.title
  let compilation = ctx.request.query.comp
  await musicService.addToStat(title, compilation)
  ctx.body = { result: 201 }
}

/* ------------------------------ */
/*             other              */
/* ------------------------------ */
