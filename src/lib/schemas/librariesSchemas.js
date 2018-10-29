exports.getLibrariesListResponse = {
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


exports.getLibraryDetailsResponse = {
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

exports.createLibraryRequest = {
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
