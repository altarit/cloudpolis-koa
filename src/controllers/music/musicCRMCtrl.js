const { HttpError } = require('src/lib/error/index')
const musicCRMService = require('src/services/musicCRMService')
const log = require('src/lib/log')(module)

exports.createCompilationsBulk = createCompilationsBulk
exports.extract = extract
exports.extractFromSources = extractFromSources
exports.dropSongs = dropSongs

/* ------------------------------ */
/*        administration          */
/* ------------------------------ */

async function extractFromSources (ctx) {
  let result = await musicCRMService.extractFromSources(ctx.params.library)
  ctx.body = { result: 200 }
}

async function extract (ctx) {
  let result = await musicCRMService.extract()
  ctx.body = { result: 200 }
}

async function dropSongs (ctx) {
  await musicCRMService.dropSongs()
  ctx.body = { result: 200 }
}

async function createCompilationsBulk (ctx) {
  let libraryName = ctx.params.libraryName
  let dataJson = ctx.request.body.tracks
  let base = ctx.request.body.base


  log.debug(libraryName + ':' + base)
  let data = JSON.parse(dataJson)
  if (!Array.isArray(data)) {
    throw new HttpError(400, 'JSON should be an array')
  }
  if (!base) {
    throw new HttpError(400, 'Base path is empty')
  }
  if (base[base.length - 1] !== '/') {
    base += '/'
  }

  let result = musicCRMService.createCompilationsBulk(libraryName, data, base)
  ctx.body = {
    result: result,
    status: 200
  }
}

/*
 {
 "dir" : "%FileDir",
 "filename": "%FileName",
 "ext": "%FileFormat",
 "parent": "%FileParentDir",
 "album": "%Album",
 "artist": "%Artist",
 "title": "%Title",
 "duration": "%Duration",
 "size": "%FileSize",
 "bitrate": "%Bitrate",
 "mark": "%Mark"
 },
 */
