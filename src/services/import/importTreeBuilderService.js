const path = require('path')

const { NotFoundError } = require('src/lib/error')
const pathService = require('src/services/pathService')
const { ImportSession } = require('src/models')
const log = require('src/lib/log')(module)

module.exports.buildImportTree = buildImportTree

const MUSIC_EXTS = ['.mp3', '.aac', '.m4a']

async function buildImportTree (sessionId) {
  const importSession = await ImportSession.findOne({ id: sessionId })
  if (!importSession) {
    throw new NotFoundError(`Import session ${sessionId} not found.`)
  }

  const { library, importPath } = importSession
  log.debug(`buildImportTree session='%s' library='%s' mainPath='%s'`, sessionId, library, importPath)

  const resultPath = path.resolve(importPath)
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
  // log.debug(`Reading '${dir.path}' directory for second level tree with root ${rootPath}`)

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
    await lookForFiles(childrenDir.path, result, rootPath)
  }
}

async function separateMusic (files, rootPath) {
  const musicFiles = []
  const otherFiles = []

  for (const file of files) {
    const ext = file.ext

    const resultFile = {
      name: file.name,
      path: file.path,
      ext: ext
    }

    if (MUSIC_EXTS.includes(ext)) {
      musicFiles.push(resultFile)
    } else {
      otherFiles.push(resultFile)
    }
  }

  return { musicFiles, otherFiles }
}
