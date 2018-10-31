const SESSION_SCHEMA = {
  type: 'object',
  property: {
    id: {
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
  required: ['id', 'library', 'importPath', 'networkPath', 'status', 'created']
}

exports.createImportSessionRequest = {
  id: '/createImportSessionRequest',
  schema: {
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
  }
}

exports.createImportSessionResponse = {
  id: '/createImportSessionResponse',
  schema: {
    properties: {
      importSessionId: {
        type: 'string',
        description: 'Id of created ImportSession.'
      },
    },
    required: ['importSessionId']
  }
}

exports.getImportSessionsByLibraryNameResponse = {
  id: '/getImportSessionsByLibraryNameResponse',
  schema: {
    properties: {
      sessions: {
        type: 'array',
        items: SESSION_SCHEMA
      }
    },
    required: ['sessions']
  }

}

exports.getImportSessionByIdResponse = {
  id: '/getImportSessionByIdResponse',
  schema: {
    properties: {
      session: SESSION_SCHEMA
    },
    required: ['session']
  }
}
