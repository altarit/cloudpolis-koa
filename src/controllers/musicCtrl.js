const { HttpError } = require('src/lib/error/index')
const musicService = require('src/services/musicService')
const log = require('src/lib/log')(module)

exports.params = {
  name: 'music',
  base: 'music/'
}

exports.search = {
  path: 'search',
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
  handler: search
}

async function search (ctx) {
  let query = ctx.request.query.query
  const filteredSongs = await musicService.searchTracksByQuery(query)
  ctx.end(filteredSongs )
}

exports.random = {
  path: 'random',
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
  handler: random
}

async function random (ctx) {
  let n = 15
  let filter = ctx.request.query.filter
  let condition = filter ? JSON.parse(filter) : { "library": { "$in": ["mlpost"] } }

  let result = await musicService.random(condition, 20)
  ctx.end(result)
  ctx.request.isLogNeeded = true
}

exports.getTrackInfo = {
  path: 'tracks/:trackId',
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
  handler: getTrackInfo
}

async function getTrackInfo (ctx) {
  const { trackId } = ctx.params

  const trackInfo = await musicService.getTrackInfo(trackId)

  ctx.end(trackInfo || {})
}

async function bySrc (ctx) {
  let href = ctx.request.query.href
  const song = await musicService.searchTrackByHref(href)
  ctx.end(song)
  ctx.request.isLogNeeded = true
}

async function addSingleStat (ctx) {
  ctx.end({})
}

async function setTrackInfo (ctx) {
  let trackId = ctx.params.trackId
  let lyrics = ctx.request.body.lyrics
  let updated = await musicService.setTrackInfo(trackId, lyrics)
  ctx.end({})
}

async function addToStat (ctx) {
  let title = ctx.request.query.title
  let compilation = ctx.request.query.comp
  await musicService.addToStat(title, compilation)
  ctx.end({})
}

