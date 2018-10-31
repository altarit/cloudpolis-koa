const LIBRARY_SCHEMA = {
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

exports.getLibrariesListResponse = {
  id: '/getLibrariesListResponse',
  schema: {
    properties: {
      libraries: {
        type: 'array',
        description: 'Libraries list.',
        items: LIBRARY_SCHEMA
      },
    },
    required: ['libraries']
  }
}


exports.getLibraryDetailsResponse = {
  id: '/getLibraryDetailsResponse',
  schema: {
    properties: {
      library: LIBRARY_SCHEMA,
    },
    required: ['library']
  }
}

exports.createLibraryRequest = {
  id: '/createLibraryRequest',
  schema: {
    properties: {
      name: {
        type: 'string',
      },
    },
    required: ['name']
  }
}

exports.createLibraryResponse = {
  id: '/createLibraryResponse',
  schema: {
    properties: {
      library: LIBRARY_SCHEMA,
    },
    required: ['library']
  }
}
