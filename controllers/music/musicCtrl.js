const HttpError = require('lib/error').HttpError;
const log = require('lib/log')(module);
const musicService = require('services/musicService');

exports.index = async function (ctx, next) {
  ctx.body = {
    api: {
      artists: '/api/music/artists',
      artistsDetail: '/api/music/artists/:id',
      random: 'api/music/random'
    }
  };
};

exports.search = async function (ctx) {
  let query = ctx.request.query.query;
  const filteredSongs = await musicService.searchTracksByQuery(query);
  ctx.body = {data: filteredSongs};
};

exports.byhref = async function (ctx) {
  let href = ctx.request.query.href;
  const song = await musicService.searchTrackByHref(href);
  ctx.body = {data: song};
  ctx.request.isLogNeeded = true;
};

exports.libraries = async function (ctx) {
  let libraries = await musicService.getAllLibraries();
  ctx.body = {data: libraries};
};

exports.libraryDetails = async function (ctx) {
  let libraryName = ctx.params.libraryName;
  let compilations = await musicService.getCompilationsByLibraryName(libraryName);
  ctx.body = {data: compilations};
};

exports.createLibrary = async function (ctx) {
  let libraryName = ctx.request.body.name;
  if (!libraryName) {
    log.debug('Parameter name is missed');
    throw new Error('Parameter name is missed');
  }
  let library = await musicService.createLibrary(libraryName);
  ctx.body = {};
};

exports.deleteLibrary = async function (ctx) {
  let libraryName = ctx.params.libraryName;
  let result = musicService.deleteLibrary(libraryName);
  ctx.body = {};
};

exports.artists = async function (ctx) {
  let artists = await musicService.getAllArtists();
  ctx.body = {data: artists};
};

exports.createCompilationsBulk = async function (ctx) {
  let libraryName = ctx.params.libraryName;
  let dataJson = ctx.request.body.tracks;
  let base = ctx.request.body.base;


  log.debug(libraryName + ':' + base);
  let data = JSON.parse(dataJson);
  if (!Array.isArray(data)) {
    throw new HttpError(400, 'JSON should be an array');
  }
  if (!base) {
    throw new HttpError(400, 'Base path is empty');
  }
  if (base[base.length - 1] !== '/') {
    base += '/';
  }

  let result = musicService.createCompilationsBulk(libraryName, data, base);
  ctx.body = {
    result: result,
    status: 200
  };
};

exports.getArtistByName = async function (ctx) {
  console.log('id: ' + ctx.params.library + '/' + ctx.params.name);
  let artist = await musicService.getArtistByName(ctx.params.library, ctx.params.name);
  if (artist) {
    ctx.body = {
      data: {
        artist: artist
      }
    };
  } else {
    throw new HttpError(404, 'Artist not found');
  }
};

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

exports.random = async function (ctx) {
  let n = 15;
  //ctx.session.randomized = ++n;
  let condition = {};
  if (n < 4) {
    condition = {mark: {$gt: 4}};
  } else if (n < 15) {
    condition = {mark: {$gt: 3}};
  }
  console.log(n + ' ' + JSON.stringify(condition));

  let result = await musicService.random(condition, 20);
  ctx.body = {data: result};
  ctx.request.isLogNeeded = true;
};

exports.extract = async function (ctx) {
  let result = await musicService.extract();
  ctx.body = {result: 200};
};

exports.dropSongs = async function (ctx) {
  await musicService.dropSongs();
  ctx.body = {result: 200};
};

exports.addToStat = async function (ctx) {
  let title = ctx.request.query.title;
  let compilation = ctx.request.query.comp;
  await musicService.addToStat(title, compilation);
  ctx.body = {result: 201};
};

