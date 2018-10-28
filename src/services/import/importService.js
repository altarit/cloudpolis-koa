const path = require('path')
const id3 = require('node-id3')

const { NotFoundError } = require('src/lib/error')
const importSessionService = require('src/services/import/importSessionService')
const { Song, Album, Compilation, Library, ImportSession } = require('src/models')
const log = require('src/lib/log')(module)

module.exports.startImportSession = startImportSession
module.exports.checkProgress = checkProgress
module.exports.extractTrackSources = extractTrackSources

async function startImportSession (sessionName) {
  const session = await ImportSession.findOne({ name: sessionName })
  const { library: libraryName, networkPath, status, trackSources, albumSources, compilationSources, importPath } = session
  if (status !== 'READY_TO_PROCESS_METADATA' && status !== 'PROCESSING_METADATA') {
    throw new Error(`Session isn't in READY_TO_PROCESS_METADATA status.`)
  }
  session.status = 'PROCESSING_METADATA'
  await session.save()

  log.debug(`Started import session ${sessionName}`)
  const tracks = await Promise.all(trackSources.map(async track => {
    const basename = path.basename(track.path)
    const trackPath = path.resolve(importPath, track.path)
    console.log(`--%s / %s`, trackPath, basename)

    const fileTags = await getTags(trackPath)

    const src = {
      path: networkPath + track.path.replace(/%/g, '%25').replace(/ /g, '%20')
    }

    return {
      preId: Date.now() + '',
      importSession: sessionName,
      title: fileTags.tagTitle || basename,
      library: libraryName,
      compilation: track.compilation,
      album: track.album,
      coauthors: fileTags.tagAuthors,
      src: src.path,
      sources: [src],
    }
  }))

  const albums = albumSources.map(album => {
    return {
      preId: Date.now() + '',
      name: album.name,
      compilation: album.album,
    }
  })

  const compilations = compilationSources.map(compilation => {
    return {
      preId: Date.now() + '',
      name: compilation.name,
    }
  })

  session.trackSources = tracks
  session.albumSources = albums
  session.compilationSources = compilations
  await session.save()
}

async function checkProgress (sessionName) {
  const count = 100//await SongSource.count({ importSession: sessionName })

  return count
}


async function getTags (path) {

  let tags
  try {
    tags = id3.read(path)
  } catch (e) {
    log.error(`Error at parsing id3 tags for ${path} via node-id3: ${e}`)
    //errors.writeIds.push(path)
    throw e
  }

  //
  // let metadata = {
  //   compilation: "AcousticBrony",
  //   library: "Artists",
  //   search: "it's ok",
  //   mark: 3,
  //   size: "11,86 MB",
  //   duration: "5:06",
  //   artist: "Acoustic Brony & Mysteriousbronie",
  //   title: "It's ok",
  //   href: "/Artists/AcousticBrony/Acoustic%20Brony%20&%20Mysteriousbronie%20-%20It's%20ok.mp3"
  // };

  //return metadata

  return {
    tagTitle: tags.title,
    tagAuthors: tags.artist,
    tagAlbum: tags.album,
    tagYear: tags.year ? tags.year.substring(0, 4) : null
  }
}


async function extractTrackSources (sessionName) {
  log.debug(`extractTrackSources %s`, sessionName)

  const session = await ImportSession.findOne({ name: sessionName })
  if (!session) {
    throw NotFoundError(`Session ${sessionName} not found.`)
  }

  const { trackSources, albumSources, compilationSources, status, library } = session
  //const songSources = [];//await SongSource.find({ importSession: importSessionId })

  //console.log(status, library, trackSources)

  log.debug(`Preparing to insert %s tracks`, trackSources.length)

  const tracks = trackSources.map(source => {
    return new Song({
      id: /*source.id || */Math.random().toString().substring(2, 12),
      src: source.src,
      sources: source.sources,
      title: source.title,
      artist: source.compilation,
      album: source.album,
      compilation: source.compilation,
      library: source.library,
      duration: source.duration,
      size: source.size,
      mark: source.mark,
      search: source.title.toLowerCase(),
      rand: Math.floor(Math.random() * 10000),
    })
  })

  log.debug(`Preparing to insert %s albums`, albumSources.length)
  const albums = albumSources.map(source => {
    return new Album({
      id: /*source.id || */Math.random().toString().substring(2, 12),
      name: source.name,
      compilation: source.compilation,
      library: library
    })
  })

  log.debug(`Preparing to insert %s compilations`, compilationSources.length)
  const compilations = compilationSources.map(source => {
    return new Compilation({
      id: /*source.id || */Math.random().toString().substring(2, 12),
      name: source.name,
      library: library,
    })
  })

  log.debug(`Save records`)
  await Song.insertMany(tracks)
  log.debug(`Save albums`)
  await Album.insertMany(albums)
  log.debug(`Save compilations`)
  await Compilation.insertMany(compilations)
  log.debug(`Done`)

  return tracks.length
}
