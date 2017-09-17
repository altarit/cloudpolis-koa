const HttpError = require('lib/error').HttpError;
const log = require('lib/log')(module);
const playlistService = require('services/playlistService');


exports.playlists = async function (ctx) {
  let playlists = await playlistService.getAllPlaylists();
  ctx.body = {
    data: {
      playlists: playlists
    }
  };
};

exports.playlistsByOwner = async function (ctx) {
  let userName = ctx.params.owner;
  let playlists = await playlistService.getPlaylistsByOwner(userName);
  ctx.body = {
    data: {
      playlists: playlists
    }
  };
};

exports.playlistDetails = async function (ctx) {
  let userName = ctx.params.owner;
  let playlistName = ctx.params.name;
  let playlist = await playlistService.getPlaylistDetails(userName, playlistName);
  ctx.body = {
    data: {
      playlist: playlist
    }
  };
};

exports.updatePlaylist = async function (ctx) {
  let userName = ctx.params.owner;
  let playlistName = ctx.params.name;
  log.debug(`Put playlist /${userName}/${playlistName}`);

  let tracks = ctx.request.body.tracks;
  if (!Array.isArray(tracks)) {
    throw new HttpError(400, 'Tracks should be an array');
  }

  let playlist = await playlistService.updatePlaylist(userName, playlistName, tracks);
  ctx.body = {
    status: 200
  };
};


exports.deletePlaylist = async function (ctx) {
  let userName = ctx.params.owner;
  let playlistName = ctx.params.name;
  log.debug(`Delete playlist /${userName}/${playlistName}`);

  let playlist = await playlistService.deletePlaylist(userName, playlistName);
  ctx.body = {
    status: 200
  };
};
