const { Album, Compilation, Song, ImportSession } = require('src/models')
const importService = require('./import/importService')
const log = require('src/lib/log')(module)

exports.deleteAllMusic = deleteAllMusic
exports.reimportAllCompletedSessions = reimportAllCompletedSessions

async function deleteAllMusic () {
  const tracksDeleted = await Song.deleteMany({})
  const albumsDeleted = await Album.deleteMany({})
  const compilationsDeleted = await Compilation.deleteMany({})

  return {
    tracksDeleted,
    albumsDeleted,
    compilationsDeleted,
  }
}

async function reimportAllCompletedSessions () {
  const sessions = await ImportSession.find({})

  log.info(`Found %s import sessions. Extract music...`, sessions.length)

  for (const session of sessions) {
    const { id, trackSources, albumSources, compilationSources } = session

    log.info(`Session '%s'`, id)
    if (!trackSources) {
      log.info(`trackSources is undefined. Skip.`)
      continue
    }
    if (!albumSources) {
      log.info(`albumSources is undefined. Skip.`)
      continue
    }
    if (!compilationSources) {
      log.info(`compilationSources is undefined. Skip.`)
      continue
    }

    const result = await importService.extractTrackSources(id)
  }

  return {
    count: sessions.length
  }
}
