const mongoose = require('src/lib/mongoose')
const { Playlist } = require('src/models')
const log = require('src/lib/log')(module)


exports.getAllPlaylists = async function () {
  const playlists = await Playlist.find({}, {
    name: 1,
    owner: 1,
    tracks: 1,
    _id: 0
  }).sort({ name: 1 }).exec()
  return playlists
}

exports.getPlaylistsByOwner = async function (owner) {
  const playlists = await Playlist.find({ owner: owner }, {
    name: 1,
    owner: 1,
    tracks: 1,
    _id: 0
  })
  return playlists
}

exports.getPlaylistDetails = async function (owner, name) {
  const playlists = await Playlist.findOne({ owner: owner, name: name }, {
    name: 1,
    owner: 1,
    tracks: 1,
    _id: 0
  })
  return playlists
}

exports.updatePlaylist = async function (owner, name, tracks) {
  let found = await Playlist.find({ owner: owner, name: name })
  if (found.length) {
    let playlist = found[0]
    playlist.tracks = tracks
    let result = await playlist.save()
    return result
  } else {
    let playlist = new Playlist({
      owner: owner,
      name: name,
      tracks: tracks
    })
    let result = await playlist.save()
    return result
  }
}

exports.deletePlaylist = async function (owner, name) {
  let result = await Playlist.remove({ owner: owner, name: name })
  return result
}
