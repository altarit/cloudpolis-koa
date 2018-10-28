const { Compilation, Library } = require('src/models')
const log = require('src/lib/log')(module)

exports.getAllLibraries = getAllLibraries
exports.getLibraryDetails = getLibraryDetails
exports.createLibrary = createLibrary
exports.deleteLibrary = deleteLibrary

async function getAllLibraries () {
  return await Library
    .find({}, { name: 1, _id: 0 })
    .sort({ title: 1 })
    .exec()
}

async function getLibraryDetails (libraryName) {
  return await Library
    .findOne({ name: libraryName }, { name: 1, _id: 0 })
}

// async function getCompilationsByLibraryName (libraryName) {
//   return await Compilation
//     .find({ library: libraryName }, { name: 1, count: 1, library: 1, fullpath: 1, _id: 0 })
// }

async function createLibrary (libraryName) {
  const library = new Library({
    id: libraryName,
    name: libraryName,
    q: libraryName
  })
  let result = await library.save()
  return result
}

async function deleteLibrary (libraryName) {
  const library = await Library.findOne({ name: libraryName })
  return await library.remove().exec()
}
