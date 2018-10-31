const { NotFoundError } = require('src/lib/error')
const musicManagerService = require('src/services/musicManagerService')
const log = require('src/lib/log')(module)

exports.params = {
  name: 'musicManager',
  base: ''
}

exports.deleteAllMusic = {
  path: 'manager/music/all',
  method: 'delete',
  description: 'Deletes all tracks, albums, compilation.',
  roles: 'admin',
  handler: deleteAllMusic
}

async function deleteAllMusic (ctx) {
  const result = await musicManagerService.deleteAllMusic()

  ctx.end(result)
}

exports.reimportAllCompletedSessions = {
  path: 'manager/music/reimport',
  method: 'post',
  description: 'Imports all tracks, albums, compilation from completed import sessions.',
  roles: 'admin',
  handler: reimportAllCompletedSessions
}

async function reimportAllCompletedSessions (ctx) {
  const result = await musicManagerService.reimportAllCompletedSessions()

  ctx.end(result)
}
