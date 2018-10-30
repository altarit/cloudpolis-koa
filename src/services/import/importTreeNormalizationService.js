const { NotFoundError } = require('src/lib/error')
const { ImportSession } = require('src/models')
const log = require('src/lib/log')(module)

module.exports.confirmSession = confirmSession

async function confirmSession (sessionId) {
  const importSession = await ImportSession.findOne({ id: sessionId })
  if (!importSession) {
    throw new Error(`Import session ${sessionId} not found.`)
  }

  if (importSession.status !== 'INITIALIZED') {
    throw new Error(`Import session status is ${importSession.status}.`)
  }

  const status = 'READY_TO_PROCESS_METADATA'
  const { tracks, albums, compilations } = normalizeLibraryTree(importSession.fileTree)

  Object.assign(importSession, {status, trackSources: tracks, albumSources: albums, compilationSources: compilations})
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
