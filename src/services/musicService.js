const { Compilation } = require('src/models/compilation')
const { Song } = require('src/models/song')
const { SongInfo } = require('src/models/songInfo')
const log = require('src/lib/log')(module)

exports.searchTracksByQuery = searchTracksByQuery
exports.searchTrackByHref = searchTrackByHref
exports.getAllArtists = getAllArtists
exports.getArtistByName = getArtistByName
exports.getTrackInfo = getTrackInfo
exports.setTrackInfo = setTrackInfo
exports.random = random
exports.addToStat = addToStat

async function searchTracksByQuery (query) {
  let filter
  try {
    filter = {
      search: { $regex: new RegExp(query.toLowerCase()) }
    }
  } catch (e) {
    throw new HttpError(402, 'Wrong filter')
  }

  let filteredSongs = await Song.find(filter).sort({ mark: -1 }).limit(50).exec()
  return filteredSongs
}

async function searchTrackByHref (src) {
  let found = await Song.find({ src: src.replace(/%/g, '%25').replace(/ /g, '%20') }).limit(1).exec()
  return found[0]
}

async function getAllArtists () {
  const compilations = await Compilation.find({}, { name: 1, count: 1, library: 1, _id: 0 }).sort({ name: 1 }).exec()
  return compilations
}

async function getArtistByName (library, name) {
  const artists = await Compilation.findOne({ library: library, name: name })
  return artists
}

async function getTrackInfo (trackId) {
  const trackInfo = await SongInfo.find({ id: trackId })
  return trackInfo[0]
}

async function setTrackInfo (trackId, lyrics) {
  log.debug(`insert ${trackId}=${lyrics}`)
  const trackInfo = await SongInfo.update({ id: trackId }, { id: trackId, lyrics: lyrics }, { upsert: true })

  log.debug(`inserted ${trackInfo}`)
  return trackInfo
}

async function random (condition, max) {
  log.debug(`Handling /random max=${max}`)
  const count = await Song.count(condition)
  let start = Math.floor(Math.random() * count - max)
  start = start < 0 ? 0 : start
  console.log('s: ' + start + '  m: ' + max)
  const result = await Song.find(condition).sort({ rand: 1 }).skip(start).limit(max).exec()
  return result
}

async function addToStat (title, compilation) {
  /*var record = new MusicStat({
   song: title,pilation,
   user: ctx.reque
   compilation: comst.user ? ctx.request.user._doc.username : null,
   session: ctx.sessionId,
   ip: ctx.request.headers['x-real-ip'] || ctx.request.ip,
   referer: ctx.request.headers['referer']
   });            */
  //await record.save();
}
