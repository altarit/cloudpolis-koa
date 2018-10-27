const { NotFoundError } = require('src/lib/error')
const librariesService = require('src/services/librariesService')
const log = require('src/lib/log')(module)

exports.params = {
  base: 'music/libraries/'
}

exports.getLibrariesList = {
  path: '',
  description: 'Returns all libraries.',
  requestSchema: {},
  method: 'get',
  responseSchema: {
    properties: {
      libraries: {
        type: 'array',
        description: 'Libraries list.',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
          },
          required: ['name']
        }
      },
    },
    required: ['libraries']
  },
  handler: getLibrariesList
}

async function getLibrariesList (ctx) {
  const libraries = await librariesService.getAllLibraries()

  ctx.end({
    libraries
  })
}

exports.getLibraryDetails = {
  path: ':libraryName',
  description: 'Returns library by name.',
  requestSchema: {},
  method: 'get',
  responseSchema: {
    properties: {
      library: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
        },
        required: ['name']
      },
    },
    required: ['library']
  },
  handler: getLibraryDetails
}

async function getLibraryDetails (ctx) {
  const { libraryName } = ctx.params

  const library = await librariesService.getLibraryDetails(libraryName)
  if (!library) {
    throw new NotFoundError(`Library ${libraryName} not found.`)
  }

  ctx.end({
    library
  })
}

exports.createLibrary = {
  path: '',
  description: 'Create a library.',
  requestSchema: {
    properties: {
      name: {
        type: 'string'
      },
    },
    required: ['name']
  },
  method: 'post',
  responseSchema: {},
  handler: createLibrary
}

async function createLibrary (ctx) {
  const { name } = ctx.request.body

  const library = await librariesService.createLibrary(name)

  ctx.end({})
}

exports.deleteLibrary = {
  path: ':libraryName',
  description: 'Delete library.',
  requestSchema: {},
  method: 'delete',
  responseSchema: {},
  handler: deleteLibrary
}

async function deleteLibrary (ctx) {
  const { libraryName } = ctx.params

  const result = librariesService.deleteLibrary(libraryName)

  ctx.end({})
}
