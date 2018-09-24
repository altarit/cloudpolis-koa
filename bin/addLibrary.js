/**
 * This algorithm of creation an library is called LCAT (Library, Compilation, Album, Track).
 * It suggests that music library has the structure below:
 * - Library
 *   - Compilation A
 *     - Album A1
 *       - Track A1a
 *       - Track A1b
 *     - Album A2
 *       - Track A2a
 *     - Track Aa
 *   - Compilation B
 *     - Track Ba
 *     ...
 *   ...
 * - Another library
 *   ...
 */

const fs = require('fs')
const path = require('path')
const mongoose = require('lib/mongoose')
const id3 = require('node-id3')

//mongoose.disconnect();
const options = {
  regexp: /^/i,
  insert: true,
  logMusic: true,
  regenerateIds: true,
  libraries: [
  //   {
  //   name: 'mlpfa',
  //   source: 'D:\\Documents\\Music\\MAv16\\Artists',
  //   id: 'aa'
  // }
  {
    name: 'mlpost',
    source: 'D:\\Documents\\Music\\MAv16\\My Little Pony Ost\\mlpost',
    id: 'ab'
  }],
  remove: false
}

const errors = {
  notMp3: [],
  id3Errors: [],
  emptyArtist: [],
  emptyTitle: [],
  writeIds: []
};


(async function () {
  console.log('Open connection')
  await new Promise((resolve) => {
    mongoose.connection.on('open', resolve)
  })

  console.log('Create models:')
  require('models/songSource')
  require('models/compilationSource')
  require('models/librarySource')
  await Promise.all(Object.keys(mongoose.models).map((modelName) => {
    console.log(' ' + modelName)
    return mongoose.models[modelName].ensureIndexes()
  }))

  console.log('Build FileSystem')
  for (let library of options.libraries) {
    await createCompilations(library.source, options.regexp, library.name, library.id)
  }
  console.log('\nDone. Press Ctrl+C for exit...')
})()

async function createCompilations(root, reg, library, libId) {
  let objects = fs.readdirSync(root)
  let allTracks = []
  let allCompilations = []
  let partOfSetFreeNum = 0
  let partOfSetArray = []
  let partOfSetMap = {}

  try {
    let partOfSetMapStr = fs.readFileSync(path.resolve(root, 'compilations.json'), 'utf8')
    partOfSetArray = JSON.parse(partOfSetMapStr)
    partOfSetMap = arrayToMap(partOfSetArray, 'part')
  } catch (err) {
    console.log(`Error at reading compilations.json`, err)
  }

  for (let el of objects) {
    let fullpath = path.resolve(root, el)
    if (!fs.lstatSync(fullpath).isDirectory() || (reg && !reg.test(el))) {
      continue
    }
    printSeparator()
    printLine(el)

    let partOfSetId = '--'
    let safeRecord = partOfSetArray.find(e => e.compilation === el)
    if (safeRecord) {
      partOfSetId = safeRecord.part
    } else {
      while (partOfSetMap[getBase64(partOfSetFreeNum)]) {
        partOfSetFreeNum++
      }
      partOfSetId = getBase64(partOfSetFreeNum)
      let newPart = {part: partOfSetId, compilation: el}
      partOfSetArray.push(newPart)
      partOfSetMap[partOfSetId] = newPart
    }

    let trackFiles = await searchTracksRecursively(fullpath, './', '', 0)
    console.log(`~~~trackFiles[${el}] = ${trackFiles.length}`)
    console.log(trackFiles)

    if (trackFiles.length) {
      let tracks = await getTracksData(fullpath, trackFiles, library, el, libId + partOfSetId)
      let comp = {
        id: libId + partOfSetId,
        name: el,
        tracks: tracks,
        library: library
      }
      console.log(`#====== found ========# ${tracks.length}`)

      allTracks.push(...tracks)
      allCompilations.push(comp)
    } else {
      console.log(`Empty compilation folder ${el}`)
    }
    partOfSetMap[partOfSetId] = el
  }

  console.log(`Found ${allTracks.length} tracks in ${allCompilations.length} compilations.`)

  fs.writeFileSync(path.resolve(root, 'compilations.json'), JSON.stringify(partOfSetArray))

  if (options.insert) {
    console.log('Drop SongSource')
    await mongoose.models.SongSource.remove({library: library})
    await mongoose.models.CompilationSource.remove({library: library})
    await mongoose.models.LibrarySource.remove({name: library})
    //await mongoose.models.Song.remove({library: library})

    console.log(`Save SongSource in db`)
    let songEntities = allTracks.map(obj => new mongoose.models.SongSource(obj))
    let insertSongsResult = await mongoose.models.SongSource.insertMany(songEntities)
    console.log(`Inserted: ${insertSongsResult.length}`)

    console.log(`Save CompilationSource in db`)
    let compEntities = allCompilations.map(obj => new mongoose.models.CompilationSource(obj))
    let insertCompResult = await mongoose.models.CompilationSource.insertMany(compEntities)
    console.log(`Inserted: ${insertCompResult.length}`)

    console.log(`Save LibrarySource in db`)
    let insertLibResult = await new mongoose.models.LibrarySource({id: libId, name: library}).save()
    console.log(`Inserted: ${insertLibResult.length}`)

  }

  console.log('--emptyTitle : ' + errors.emptyTitle.length + '--')
  console.log(errors.emptyTitle)
  console.log('--emptyArtist : ' + errors.emptyArtist.length + '--')
  console.log(errors.emptyArtist)
  console.log('--id3Errors : ' + errors.id3Errors.length + '--')
  console.log(errors.id3Errors)
  console.log('--notMp3 : ' + errors.notMp3.length + '--')
  console.log(errors.notMp3)
  console.log('--writeIds : ' + errors.writeIds.length + '--')
  console.log(errors.writeIds)
}

async function searchTracksRecursively(root, fromroot, dirName, depth) {
  let dir = path.resolve(root, fromroot)
  let objects = fs.readdirSync(dir)
  let content = []

  console.log(`${root} -- ${fromroot} -- ${dir}`)

  for (let el of objects) {
    let fullpath = path.resolve(dir, el)
    let relativePath = fromroot + el
    if (fs.lstatSync(fullpath).isDirectory()) {
      printLine(el, depth + 1)
      let insideData = await searchTracksRecursively(root, relativePath + '/', el, depth + 1)
      if (insideData.length) {
        content = content.concat(insideData)
      } else {
        console.log("empty folder")
      }
    } else {
      if (/^.*\.(mp3|ogg|m4a|aac)$/i.test(el)) {
        if (options.logMusic) {
          printLine(el, depth + 1)
        }
        content.push({
          fullpath: fullpath,
          relativePath: relativePath.substring(2),
          fileName: el,
          dirName: dirName
        })
      }
    }
  }
  return content
}

async function getTracksData(root, trackFiles, library, compilation, compId) {
  let content = []
  let trackNoFreeNum = 0
  let trackNoArray = []
  let trackNoMap = {}

  try {
    let partOfSetMapStr = fs.readFileSync(path.resolve(root, 'tracks.json'), 'utf8')
    trackNoArray = JSON.parse(partOfSetMapStr)
    trackNoMap = arrayToMap(trackNoArray, 'no')
  } catch (err) {
    console.log(`Error at reading compilations.json`, err)
  }


  for (let trackFile of trackFiles) {

    let trackNo = '--'
    let safeRecord = trackNoArray.find(e => e.path === trackFile.relativePath)
    if (safeRecord) {
      trackNo = safeRecord.no
    } else {
      while (trackNoMap[getBase64(trackNoFreeNum)]) {
        trackNoFreeNum++
      }
      trackNo = getBase64(trackNoFreeNum)
      let newPart = {no: trackNo, path: trackFile.relativePath}
      trackNoArray.push(newPart)
      trackNoMap[trackNo] = newPart
    }


    let metadata = await getTags(trackFile.fullpath)
    metadata.src = '/' + library + '/' + compilation + '/' + trackFile.relativePath.replace(/%/g, '%25').replace(/ /g, '%20')
    if (!metadata.artist) {
      errors.emptyArtist.push(trackFile.relativePath)
      metadata.artist = compilation
    }
    if (!metadata.title) {
      errors.emptyTitle.push(trackFile.relativePath)
      metadata.title = trackFile.fileName
    }
    if (!metadata.album) {
      metadata.album = ''
    }
    metadata.library = library
    metadata.search = metadata.title.toLowerCase()
    metadata.compilation = compilation
    metadata.id = compId + trackNo

    content.push(metadata)
  }

  fs.writeFileSync(path.resolve(root, 'tracks.json'), JSON.stringify(trackNoArray))
  return content
}

function printLine(str, depth) {
  console.log(new Array((depth | 0) * 4 + 1).join(' ') + str)
}

function printSeparator() {
  console.log('\n' + new Array(60).join('-') + '\n')
}

async function getTags(path) {

  let tags
  try {
    console.log(`reading ${path}`)
    tags = id3.read(path)
  } catch (e) {
    console.log(`Error at parsing id3 tags for ${path} via node-id3: ${e}`)
    errors.writeIds.push(path)
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
    title: tags.title,
    artist: tags.artist,
    album: tags.album,
    year: tags.year ? tags.year.substring(0, 4) : null
  }
}

const BASE64_ABC = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"

function getBase64(n) {
  if (n < 0 || n >= 64 * 64) {
    throw Error(`Number ${n} is out of boundaries.`)
  }
  let first = BASE64_ABC[n >> 6]
  let second = BASE64_ABC[n % 64]
  //console.log(`n=${n}`)
  return first + second
}

function arrayToMap(arr, key) {
  let resultMap = {}
  for (let el of arr) {
    resultMap[el[key]] = el
  }
  return resultMap
}
