const { HttpError } = require('src/lib/error')
const playlistService = require('src/services/playlistService')
const log = require('src/lib/log')(module)

exports.playlists = playlists
exports.playlistsByOwner = playlistsByOwner
exports.playlistDetails = playlistDetails
exports.updatePlaylist = updatePlaylist
exports.deletePlaylist = deletePlaylist

async function playlists (ctx) {
  const playlists = await playlistService.getAllPlaylists()
  ctx.body = {
    data: {
      playlists: playlists
    }
  }
}

async function playlistsByOwner (ctx) {
  const userName = ctx.params.owner
  const playlists = await playlistService.getPlaylistsByOwner(userName)
  ctx.body = {
    data: {
      playlists: playlists
    }
  }
}

async function playlistDetails (ctx) {
  const userName = ctx.params.owner
  const playlistName = ctx.params.name
  const playlist = await playlistService.getPlaylistDetails(userName, playlistName)
  ctx.body = {
    data: {
      playlist: playlist
    }
  }
}

async function updatePlaylist (ctx) {
  const userName = ctx.params.owner
  const playlistName = ctx.params.name
  log.debug(`Put playlist /%s/%s`, userName, playlistName)

  const tracks = ctx.request.body.playlist.tracks
  if (!Array.isArray(tracks)) {
    throw new HttpError(400, 'Tracks should be an array')
  }

  const playlist = await playlistService.updatePlaylist(userName, playlistName, tracks)
  ctx.body = {
    status: 200
  }
}

async function deletePlaylist (ctx) {
  const userName = ctx.params.owner
  const playlistName = ctx.params.name
  log.debug(`Delete playlist /%s/%s`, userName, playlistName)

  let playlist = await playlistService.deletePlaylist(userName, playlistName)
  ctx.body = {
    status: 200
  }
}
