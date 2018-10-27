const { NotFoundError } = require('src/lib/error/index')
const importService = require('src/services/import/importService')
const importSessionService = require('src/services/import/importSessionService')
const log = require('src/lib/log')(module)

exports.params = {
  base: 'manager/'
}

exports.createImportSession = {
  path: 'libraries/:libraryName/import/sessions',
  description: 'Creates new INITIALIZED ImportSession.',
  requestSchema: {
    properties: {
      importPath: {
        type: 'string',
        description: 'Full path to the import directory.'
      },
      networkPath: {
        type: 'string',
        description: 'Network path that provides files from {mainPath}.'
      }
    },
    required: ['importPath', 'networkPath']
  },
  method: 'post',
  responseSchema: {
    properties: {
      importSessionId: {
        type: 'string',
        description: 'Id of created ImportSession.'
      },
    },
    required: ['importSessionId']
  },
  handler: createImportSession
}

async function createImportSession (ctx) {
  const { params, request } = ctx
  const { libraryName } = params
  const { importPath, networkPath } = request.body

  const result = await importSessionService.createImportSession(libraryName, importPath, networkPath)

  ctx.end({
    importSessionId: result
  })
}

exports.getImportSessionsByLibraryName = {
  path: 'libraries/:libraryName/import/sessions',
  description: 'Get all import sessions in specified library.',
  method: 'get',
  responseSchema: {
    properties: {
      sessions: {
        type: 'array',
        items: {
          type: 'object',
          property: {
            name: {
              type: 'string'
            },
            library: {
              type: 'string'
            },
            importPath: {
              type: 'string'
            },
            networkPath: {
              type: 'string'
            },
            status: {
              type: 'string'
            },
            created: {
              type: 'string'
            },
          },
          required: ['name', 'library', 'importPath', 'networkPath', 'status', 'created']
        }
      },
    },
    required: ['sessions']
  },
  handler: getImportSessionsByLibraryName
}

async function getImportSessionsByLibraryName (ctx) {
  const { libraryName } = ctx.params

  const sessions = await importSessionService.getImportSessionsByLibraryName(libraryName)

  ctx.end({
    sessions
  })
}

exports.getImportSessionByName = {
  path: 'imports/:sessionName',
  description: 'Get import sessions by name.',
  method: 'get',
  responseSchema: {
    properties: {
      session: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          library: {
            type: 'string'
          },
          importPath: {
            type: 'string'
          },
          networkPath: {
            type: 'string'
          },
          status: {
            type: 'string'
          },
          created: {
            type: 'string'
          },
        },
        required: ['name', 'library', 'importPath', 'networkPath', 'status', 'created']
      }
    },
    required: ['session']
  },
  handler: getImportSessionByName
}

async function getImportSessionByName (ctx) {
  const { sessionName } = ctx.params

  const session = await importSessionService.getImportSessionByName(sessionName)
  if (!session) {
    throw new NotFoundError(`Session ${sessionName} not found.`)
  }

  ctx.end({
    session
  })
}
