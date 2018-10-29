exports.getCompilationsListResponse = {
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

exports.getCompilationByNameResponse = {
  properties: {
    artists: {
      type: 'object',
    },
  },
  required: ['artist']
}
