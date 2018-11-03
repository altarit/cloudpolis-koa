exports.searchResponse = {
  id: '/searchResponse',
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

exports.randomResponse = {
  id: '/randomResponse',
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

exports.getTrackInfoResponse = {
  id: '/getTrackInfoResponse',
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
