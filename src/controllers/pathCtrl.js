const pathService = require('src/services/pathService')
const log = require('src/lib/log')(module)

exports.params = {
  name: 'path',
  base: 'path/'
}

exports.getDir = {
  path: 'dir',
  description: 'Provides file system navigation.',
  requestSchema: {
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
  },
  method: 'post',
  roles: 'admin',
  responseSchema: {
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
  },
  handler: getDir
}

async function getDir (ctx) {
  const { mainPath = __dirname, additionalPath = '.' } = ctx.request.body

  const result = await pathService.getDir(mainPath, additionalPath)

  ctx.end({
    path: result.path,
    files: result.files,
    drives: result.drives
  })
}

exports.checkAvailability = {
  path: 'availability',
  description: 'Checks whether files in {importPath} directory can be accessed with {networkPath} uri.',
  requestSchema: {
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
  },
  method: 'post',
  roles: 'admin',
  responseSchema: {
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
  },
  handler: checkAvailability
}

async function checkAvailability (ctx) {
  const { importPath, networkPath } = ctx.request.body

  const result = await pathService.checkAvailability(importPath, networkPath)

  ctx.end(result)
}
