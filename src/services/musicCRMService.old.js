const mongoose = require('src/lib/mongoose')
const { Compilation } = require('src/models/compilation')
const { Album } = require('src/models/album')
const { Song } = require('src/models/song')
const { SongInfo } = require('src/models/songInfo')
const { Library } = require('src/models/library')

const { SongSource } = require('src/models/songSource')
const { LibrarySource } = require('src/models/librarySource')
const { CompilationSource } = require('src/models/compilationSource')

const log = require('src/lib/log')(module)

exports.createCompilationsBulk = createCompilationsBulk
exports.dropSongs = dropSongs
exports.extract = extract

async function createCompilationsBulk (libraryName, data, base) {
  log.debug(`createCompilationsBulk for '${libraryName}' library`)
  let library = await Library.find({ name: libraryName })

  let startTime = Date.now()
  let compHash = {}
  let trackCount = 0
  //let albumHash = {};
  for (let song of data) {
    if (!song.dir || !song.filename) {
      log.error('Missed params')
      continue
    }
    //log.debug('----------');
    //log.debug(song);
    if (!song.dir.startsWith(base)) {
      log.error(`Song ${song.dir} doesn't start with ${base}`)
      continue
    }
    let path = song.dir.substring(base.length)
    log.debug(`path: ${path}`)
    let compName = path.indexOf('/') == -1 ? path : path.substring(0, path.indexOf('/'))
    if (!compName) {
      log.error(`Error: empty compilation name for ${song.dir}`)
      continue
    }

    if (!compHash[compName]) {
      log.debug(`new compilation: ${compName}`)
      compHash[compName] = []
    }
    let compTracks = compHash[compName]


    let restPath = path.substring(compName.length + 1)
    // log.debug(`restPath=${restPath}`);

    let albumName = null
    //let albumTracks = null;
    if (restPath) {
      albumName = restPath.indexOf('/') == -1 ? restPath : restPath.substring(0, restPath.indexOf('/'))
      log.debug(`albumName=${albumName}`)

      // if (albumName) {
      //   if (!albumHash[albumName]) {
      //     log.debug(`new album: ${albumName}`);
      //     albumHash[albumName] = [];
      //   }
      //   albumTracks = albumHash[albumName];
      // }
    }

    let content = {}
    content.src = `/${libraryName}/${path}/${song.filename}`.replace(/%/g, '%25').replace(/ /g, '%20') + '.' + song.ext.toLowerCase()
    content.title = song.title || song.filename
    content.artist = song.artist || compName
    //content.album = song.album || song.parent;
    content.duration = song.duration
    content.size = song.size
    content.mark = (song.mark || '').length
    content.search = content.title.toLowerCase()
    content.library = libraryName
    content.compilation = compName
    if (albumName) {
      content.album = albumName
    }

    //log.debug(content);
    trackCount++
    compTracks.push(content)
    // if (albumTracks) {
    //   albumTracks.push(content);
    // }
  }

  let grouppedTracksTime = Date.now()
  log.debug(`processed ${trackCount}/${data.length} tracks for ${grouppedTracksTime - startTime} ms`)
  if (trackCount !== data.length) {
    log.error('found errors, the operation is cancelled')
    return
  }

  let compCount = 0
  for (let compName of Object.keys(compHash)) {
    let compTracks = compHash[compName]
    log.debug(`adding compilation '${compName}' with ${compTracks.length} tracks...`)
    let compilation = new Compilation({
      name: compName,
      library: libraryName,
      songs: compTracks,
      count: compTracks.length,
    })
    await compilation.save()
    for (let content of compTracks) {
      let song = new Song(content)
      song.rand = Math.floor(Math.random() * 10000)
      await song.save()
    }
    log.debug(`added compilation '${compName}' with ${compTracks.length} tracks`)
    compCount++
  }

  let finishTime = Date.now()
  log.debug(`processed ${compCount}/${Object.keys(compHash).length} compilations`)
  log.debug(`written in database for ${finishTime - grouppedTracksTime} ms`)

  return compHash
}

function getDirPathFromFullPath (fullPath) {
  const lastSlash = fullPath.lastIndexOf('/', fullPath.length - 2)
  return fullPath.substring(0, lastSlash + 1)
}

function getNameFromFullPath (fullPath) {
  const lastSlash = fullPath.lastIndexOf('/', fullPath.length - 2)
  return fullPath.slice(lastSlash + 1, -1)
}

async function dropSongs () {
  const songs = mongoose.connection.collections['songs']
  if (songs) songs.drop()
  const compilations = mongoose.connection.collections['compilations']
  if (compilations) compilations.drop()
}

// exports.extract = async function () {
//   const allCompilations = await Compilation.find({});
//   const allSongs = [];
//
//   allCompilations.forEach((currentCompilation) => {
//     console.log(currentCompilation.name);
//     currentCompilation.songs.map(function (currentSong) {
//       const newSong = new Song({
//         src: currentSong.src,
//         title: currentSong.title,
//         artist: currentSong.artist,
//         album: currentSong.album,
//         compilation: currentCompilation.name,
//         library: currentCompilation.library,
//         duration: currentSong.duration,
//         size: currentSong.size,
//         mark: currentSong.mark,
//         search: currentSong.title.toLowerCase(),
//         rand: Math.floor(Math.random()*10000)
//       });
//       console.log(' - ' + currentSong.title);
//       allSongs.push(newSong);
//     });
//   });
//
//   console.log(`Removing song collection...`);
//   const removed = await Song.remove({});
//   console.log(`Removed ${removed} records`);
//   console.log(`Inserting ${allSongs.length} records`);
//   await Song.insertMany(allSongs);
// };

async function extract () {
  console.log(`Extracting sources...`)
  let librarySources = await LibrarySource.find()
  let compilationSources = await CompilationSource.find()
  let songSources = await SongSource.find()

  let allTracks = []
  let compTracksMap = {}
  for (let source of songSources) {
    let track = new Song({
      id: source.id,
      src: source.src,
      title: source.title,
      artist: source.artist,
      album: source.album,
      compilation: source.compilation,
      library: source.library,
      duration: source.duration,
      size: source.size,
      mark: source.mark,
      search: source.title.toLowerCase(),
      rand: Math.floor(Math.random() * 10000)
    })
    allTracks.push(track)
    if (!compTracksMap[track.compilation]) {
      compTracksMap[track.compilation] = []
    }
    compTracksMap[track.compilation].push(track)
  }

  let libraries = librarySources.map(source => new Library(source))
  let compilations = compilationSources.map(source => new Compilation({
    id: source.id,
    name: source.name,
    library: source.library,
    songs: compTracksMap[source.name]
  }))

  console.log(`Removing song collection...`)
  await Song.remove()
  await Compilation.remove()
  await Library.remove()
  console.log(`Inserting records`)
  await Song.insertMany(allTracks)
  await Compilation.insertMany(compilations)
  await Library.insertMany(libraries)
}
