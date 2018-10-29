exports.getLibrariesListResponse = {
  id: '/getLibrariesListResponse',
  schema: {
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
            created: {
              type: 'string'
            },
          },
          required: ['name', 'created']
        }
      },
    },
    required: ['libraries']
  }
}


exports.getLibraryDetailsResponse = {
  id: '/getLibraryDetailsResponse',
  schema: {
    properties: {
      library: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          created: {
            type: 'string'
          },
        },
        required: ['name', 'created']
      },
    },
    required: ['library']
  }
}

exports.createLibraryRequest = {
  id: '/createLibraryRequest',
  schema: {
    properties: {
      name: {
        type: 'string'
      },
      created: {
        type: 'string'
      },
    },
    required: ['name', 'created']
  }
}
