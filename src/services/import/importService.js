const path = require('path')
const id3 = require('node-id3')

const { NotFoundError } = require('src/lib/error')
const { Song, Album, Compilation, Library, ImportSession } = require('src/models')
const { IMPORT_STATUSES } = ImportSession
const { getIdString } = require('src/lib/mongoose')
const log = require('src/lib/log')(module)

module.exports.startImportSession = startImportSession
module.exports.checkProgress = checkProgress
module.exports.extractTrackSources = extractTrackSources

async function startImportSession (sessionId) {
  const session = await ImportSession.findOne({ id: sessionId })

  if (!session) {
    throw new NotFoundError(`Not found session with id ${sessionId}`)
  }

  const { library: libraryName, networkPath, status, trackSources, albumSources, compilationSources, importPath } = session

  if (status !== IMPORT_STATUSES.CONFIRMED) {
    throw new Error(`Session is in ${status} status. Expected ${IMPORT_STATUSES.CONFIRMED}.`)
  }
  if (!session.trackSources) {
    throw new Error(`Import session has empty trackSources.`)
  }
  if (!session.albumSources) {
    throw new Error(`Import session has empty albumSources.`)
  }
  if (!session.compilationSources) {
    throw new Error(`Import session has empty compilationSources.`)
  }

  session.status = IMPORT_STATUSES.PROCESSING_METADATA
  await session.save()

  log.debug(`Started processing metadata for import session ${sessionId},`)
  const tracks = await Promise.all(trackSources.map(async (track, i) => {
    const basename = path.basename(track.path)
    const trackPath = path.resolve(importPath, track.path)
    log.debug(`--%s[] %s / %s`, i, trackPath, basename)

    if (i > 0 && (i % 100 === 0)) {
      const currentSession = await ImportSession.findOne({ id: sessionId })

      if (currentSession.status === IMPORT_STATUSES.CANCELLING_PROCESSING_METADATA) {
        currentSession.status = IMPORT_STATUSES.CONFIRMED
        await currentSession.save()
        throw new Error(`Cancelled processing metadata for session '${sessionId}'.`)
      } else if (currentSession.status !== IMPORT_STATUSES.PROCESSING_METADATA) {
        throw new Error(`Session ${sessionId} is in '${currentSession.status} status. Stop processing metadata.`)
      } else {
        log.info(`Processing metadata for %s session. Completed %s/%s tracks.`, sessionId, i, trackSources.length)
      }
    }

    const fileTags = await getTags(trackPath)

    const src = {
      path: networkPath + track.path.replace(/%/g, '%25').replace(/ /g, '%20')
    }

    const id = getIdString()

    return {
      id: id,
      title: fileTags.tagTitle || basename,
      library: libraryName,
      importSession: sessionId,
      compilation: track.compilation,
      album: track.album,
      coauthors: fileTags.tagAuthors,
      src: src.path,
      sources: [src],
    }
  }))

  const albums = albumSources.map(album => {
    const id = getIdString()

    return {
      id: id,
      name: album.name,
      library: libraryName,
      importSession: sessionId,
      compilation: album.compilation,
    }
  })

  const compilations = compilationSources.map(compilation => {
    const id = getIdString()

    return {
      id: id,
      name: compilation.name,
      library: libraryName,
      importSession: sessionId,
    }
  })

  session.trackSources = tracks
  session.albumSources = albums
  session.compilationSources = compilations
  session.status = IMPORT_STATUSES.PROCESSED_METADATA
  // TOLAZY: It would be nice to check the session in database in case it has been updated.
  await session.save()
}

async function checkProgress (sessionId) {
  const session = await ImportSession.findOne({ id: sessionId })
  if (!session.trackSources) {
    throw new Error(`Import session has empty trackSources.`)
  }
  return {
    completed: session.trackSources.length,
    status: session.status,
  }
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

async function extractTrackSources (sessionId) {
  log.debug(`extractTrackSources %s`, sessionId)

  const session = await ImportSession.findOne({ id: sessionId })
  if (!session) {
    throw NotFoundError(`Session ${sessionId} not found.`)
  }

  const { trackSources, albumSources, compilationSources, status, library } = session

  if (status !== IMPORT_STATUSES.PROCESSED_METADATA) {
    throw new Error(`Session is in ${status} status. Expected ${IMPORT_STATUSES.PROCESSED_METADATA}.`)
  }
  if (!session.trackSources) {
    throw new Error(`Import session has empty trackSources.`)
  }
  if (!session.albumSources) {
    throw new Error(`Import session has empty albumSources.`)
  }
  if (!session.compilationSources) {
    throw new Error(`Import session has empty compilationSources.`)
  }

  //const songSources = [];//await SongSource.find({ importSession: importSessionId })

  //console.log(status, library, trackSources)

  log.debug(`Preparing to insert %s tracks`, trackSources.length)

  const tracks = trackSources.map(source => {
    return new Song({
      id: source.id,
      library: source.library,
      importSession: sessionId,
      compilation: source.compilation,
      album: source.album,
      title: source.title,
      src: source.src,
      sources: source.sources,
      artist: source.compilation,
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
      id: source.id,
      name: source.name,
      library: library,
      importSession: sessionId,
      compilation: source.compilation,
    })
  })

  log.debug(`Preparing to insert %s compilations`, compilationSources.length)
  const compilations = compilationSources.map(source => {
    return new Compilation({
      id: source.id,
      name: source.name,
      library: library,
      importSession: sessionId,
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
