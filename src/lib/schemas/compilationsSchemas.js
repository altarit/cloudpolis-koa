exports.getCompilationsListResponse = {
  id: '/getCompilationsListResponse',
  schema: {
    properties: {
      artists: {
        type: 'array',
        items: {
          type: 'object',
        },
      },
    },
    required: ['artists']
  }
}

exports.getCompilationByNameResponse = {
  id: '/getCompilationByNameResponse',
  schema: {
    properties: {
      artists: {
        type: 'object',
      },
    },
    required: ['artist']
  }
}
