exports.getDirRequest = {
  id: '/getDirRequest',
  schema: {
    properties: {
      mainPath: {
        type: 'string',
        description: 'Full path to the directory.'
      },
      additionalPath: {
        type: 'string',
        description: 'Additional relative path for {mainPath} parameter.'
      }
    },
    required: []
  }
}

exports.getDirResponse = {
  id: '/getDirResponse',
  schema: {
    properties: {
      path: {
        type: 'string',
        description: 'Full path to the directory.'
      },
      files: {
        type: 'array',
        description: 'Files and directories contained in the directory.',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            ext: {
              type: 'string'
            },
            path: {
              type: 'string'
            },
            isDir: {
              type: 'string'
            },
            size: {
              type: 'string'
            },
          },
          required: ['name', 'ext', 'path', 'isDir', 'size']
        }
      },
      drives: {
        type: 'array',
        description: 'Available disk drives with mount points.',
        items: {
          type: 'object',
          properties: {
            mountpoint: {
              type: 'string'
            }
          },
          required: ['mountpoint']
        }
      },
    },
    required: ['path', 'files', 'drives']
  }
}

exports.checkAvailabilityRequest = {
  id: '/checkAvailabilityRequest',
  schema: {
    properties: {
      importPath: {
        type: 'string',
        description: 'Full path to a directory.'
      },
      networkPath: {
        type: 'string',
        description: 'Uri to the server that provides static files.'
      }
    },
    required: ['importPath', 'networkPath']
  }
}


exports.checkAvailabilityResponse = {
  id: '/checkAvailabilityResponse',
  schema: {
    properties: {
      isReadingAvailable: {
        type: 'boolean',
        description: 'Shows whether files in {importPath} directory are accessible by {networkPath}.'
      },
      isCreationAvailable: {
        type: 'boolean',
        description: 'Shows whether files can be created in {importPath} directory.'
      },
      checkedFiles: {
        type: 'number',
        description: 'Shows hiw many files was read during the check.'
      },
    },
    required: ['isReadingAvailable', 'isCreationAvailable', 'checkedFiles']
  }
}
