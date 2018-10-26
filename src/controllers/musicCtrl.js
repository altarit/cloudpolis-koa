const { HttpError } = require('src/lib/error/index')
const musicService = require('src/services/musicService')
const log = require('src/lib/log')(module)



exports.search = search
exports.random = random
exports.bySrc = bySrc
exports.getTrackInfo = getTrackInfo
exports.setTrackInfo = setTrackInfo
exports.addToStat = addToStat
exports.addSingleStat = addSingleStat


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

