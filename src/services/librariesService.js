const { Compilation, Library } = require('src/models')
const log = require('src/lib/log')(module)

exports.getAllLibraries = getAllLibraries
exports.getLibraryDetails = getLibraryDetails
exports.createLibrary = createLibrary
exports.deleteLibrary = deleteLibrary

async function getAllLibraries () {
  return await Library
    .find({}, {name: 1, created: 1, _id: 0 })
    .sort({ created: 1 })
    .exec()
}

async function getLibraryDetails (libraryName) {
  return await Library
    .findOne({ name: libraryName }, { name: 1, created: 1, _id: 0 })
}

async function createLibrary (libraryName) {
  const library = new Library({
    id: libraryName,
    name: libraryName,
  })

  return await library.save()
}

async function deleteLibrary (libraryName) {
  const result = await Library.findOneAndDelete({ name: libraryName })

  return {
    deleted: result
  }
}
