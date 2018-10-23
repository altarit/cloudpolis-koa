const fs = require('fs')
const path = require('path')
const id3 = require('node-id3')

const pathService = require('src/services/pathService')
const { SongSource } = require('src/models/songSource')
const { Song } = require('src/models/song')
const { ImportSession } = require('src/models/importSession')

const log = require('src/lib/log')(module)

module.exports.startImportSession = startImportSession
module.exports.checkProgress = checkProgress
module.exports.prepareImportSession = prepareImportSession
module.exports.extractTrackSources = extractTrackSources
module.exports.getImportSessionsByLibraryName = getImportSessionsByLibraryName
module.exports.getImportSessionByName = getImportSessionByName
module.exports.buildImportTree = buildImportTree
module.exports.confirmSession = confirmSession

const MUSIC_EXTS = ['.mp3', '.aac', '.m4a']

async function startImportSession (importSessionId, mainPath, trackSources, albumSources, compilationSources, libraryName, networkPath, session) {
  log.debug(`Started import session '%s' mainPath=${mainPath} networkPath=${networkPath} libraryName=${libraryName}`, importSessionId)
  const tracks = await Promise.all(trackSources.map(async track => {
    const basename = path.basename(track.path)
    const trackPath = path.resolve(mainPath, track.path)
    console.log(`--%s / %s`, trackPath, basename)

    const fileTags = await getTags(trackPath)

    const src = {
      path: networkPath + track.path.replace(/%/g, '%25').replace(/ /g, '%20')
    }

    return {
      preId: Date.now() + '',
      importSession: importSessionId,
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

  session.tracks = tracks
  session.albums = albums
  session.compilations = compilations
  await session.save()
}

async function checkProgress (sessionName) {
  const count = await SongSource.count({ importSession: sessionName })

  return count
}

async function getImportSessionsByLibraryName (libraryName) {
  return await ImportSession.find({ library: libraryName })
}

async function getImportSessionByName (name) {
  return await ImportSession.findOne({ name: name })
}

async function prepareImportSession (libraryName, importPath, networkPath) {
  const session = new ImportSession({
    name: 'm' + Date.now(),
    library: libraryName,
    importPath,
    networkPath,
    status: 'INITIALIZED',
  })
  await session.save()

  return session.name

  // if (['INITIALIZED'].includes(session.status)) {
  //   const tree = await buildImportTree(libraryName, importPath, networkPath)
  //
  //   session.tree = tree
  //   session.status = 'PREPARED'
  //   tree.save()
  // }
  //
  // return session
}

async function confirmSession (sessionName) {
  const importSession = await ImportSession.findOne({ name: sessionName })
  if (!importSession) {
    throw new Error(`Import session ${sessionName} not found.`)
  }

  if (importSession.status !== 'INITIALIZED') {
    throw new Error(`Import session status is ${importSession.status}.`)
  }

  const status = 'PROCESSING_METADATA'
  const { tracks, albums, compilations } = normalizeLibraryTree(importSession.fileTree)

  importSession.status = status
  importSession.trackSources = tracks
  importSession.albumSources = albums
  importSession.compilationSources = compilations
  await importSession.save()

  return importSession
}


function normalizeLibraryTree (libraryTree) {
  const tracks = []
  const albums = []
  const compilations = []
  const result = { tracks, albums, compilations }

  normalizeNextLevel(result, libraryTree, {})

  return result
}


function normalizeNextLevel (result, node, options = {}) {
  const newOptions = { ...options }

  const { type, name } = node
  if (type === 'compilation') {
    result.compilations.push({
      ...newOptions,
      name,
    })
    newOptions.compilation = name
  } else if (type === 'album') {
    result.albums.push({
      ...newOptions,
      name,
    })
    newOptions.album = name
  }

  node.tracks && node.tracks.forEach(track => result.tracks.push({
    ...newOptions,
    path: track.path,
    //name: track.name,
  }))

  node.children && node.children.forEach(dir => normalizeNextLevel(result, dir, newOptions))
}


async function buildImportTree (sessionName, libraryName, mainPath, networkPath) {
  log.debug(`buildImportTree libraryName=%s mainPath='%s' networkPath='%s'`, libraryName, mainPath, networkPath)

  const importSession = await ImportSession.findOne({ name: sessionName })
  if (!importSession) {
    throw new Error(`Import session ${sessionName} not found.`)
  }

  const resultPath = path.resolve(mainPath)
  const { directories: rootDirectories, files: rootFiles } = await pathService.readDirSeparated(resultPath, resultPath)
  const { musicFiles, otherFiles } = await separateMusic(rootFiles)
  log.debug(`Found in root directory: directories - ${rootDirectories.length}, files - ${rootFiles.length} `)

  const childrenNodes = await Promise.all(
    rootDirectories.map(secondLevelDir => getSecondLevelTree(secondLevelDir, resultPath))
  )

  const fileTree = buildLibraryTreeType({
    children: childrenNodes,
    tracks: musicFiles,
  })
  importSession.fileTree = fileTree
  await importSession.save()

  return fileTree
}

function buildLibraryTreeType (fileTree) {
  const nextCompilations = []

  if (fileTree.tracks && fileTree.tracks.length) {
    nextCompilations.push({
      name: '',
      type: 'compilation',
      albums: [{
        name: 'Singles',
        type: 'album',
        tracks: copyTracks(fileTree.tracks)
      }],
    })
  }

  const compilations = fileTree.children || []
  for (const compilation of compilations) {
    const nextCompilation = {
      name: compilation.name,
      type: 'compilation',
      children: []
    }

    nextCompilation.children.push({
      name: `${compilation.name}: singles`,
      type: 'album',
      tracks: copyTracks(compilation.tracks)
    })

    const albums = compilation.children || []
    for (const album of albums) {
      const nextAlbum = {
        name: album.name,
        type: 'album',
        tracks: copyTracks(album.tracks)
      }
      nextCompilation.children.push(nextAlbum)
    }

    nextCompilations.push(nextCompilation)
  }

  return {
    type: 'library',
    children: nextCompilations
  }
}

function copyTracks (tracks) {
  if (!tracks || !tracks.length) {
    return
  }

  return tracks.map(track => {
    return {
      name: track.name,
      type: 'track',
      path: track.path,
    }
  })
}


async function getSecondLevelTree (dir, rootPath) {
  // log.debug(`Reading '${dir.path}' directory for second level tree nodes`)
  const name = path.basename(dir.path)
  const { directories: thirdLevelDirectories, files: compilationFiles } = await pathService.readDirSeparated(dir.path, rootPath)
  const { musicFiles, otherFiles } = await separateMusic(compilationFiles)

  const thirdLevelNodes = await Promise.all(
    thirdLevelDirectories.map(thirdLevelDir => getThirdLevelNodes(thirdLevelDir, rootPath))
  )

  return {
    name: name,
    path: thirdLevelNodes.path,
    children: thirdLevelNodes,
    tracks: musicFiles,
  }
}

async function getThirdLevelNodes (dir, rootPath) {
  const name = path.basename(dir.path)
  const files = []

  await lookForFiles(dir.path, files, rootPath)
  const { musicFiles, otherFiles } = await separateMusic(files)

  return {
    name: name,
    tracks: musicFiles
  }
}

async function lookForFiles (dirPath, result, rootPath) {
  const { directories, files } = await pathService.readDirSeparated(dirPath, rootPath)

  result.push(...files)

  for (const childrenDir of directories) {
    await lookForFiles(childrenDir.path, result)
  }
}

async function separateMusic (files, rootPath) {
  const musicFiles = []
  const otherFiles = []

  for (const file of files) {
    const ext = file.ext

    if (MUSIC_EXTS.includes(ext)) {
      musicFiles.push({
        name: file.name,
        path: file.path,
        ext: ext
      })
    } else {
      otherFiles.push({
        name: file.name,
        path: file.path,
        ext: ext
      })
    }
  }

  return { musicFiles, otherFiles }
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


async function extractTrackSources (importSessionId) {
  const songSources = await SongSource.find({ importSession: importSessionId })

  console.log(`Preparing to insert %s tracks`, songSources.length)

  const tracks = songSources.map(source => {
    return new Song({
      id: source.id,
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
      rand: Math.floor(Math.random() * 10000)
    })
  })
  console.log(`Inserting records`)
  await Song.insertMany(tracks)
  console.log(`Done`)

  return tracks.length
}
