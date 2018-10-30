exports.buildTreeResponse = {
  id: '/buildTreeResponse',
  schema: {
    properties: {
      fileTree: {
        type: 'object',
      },
    },
    required: ['fileTree']
  }
}

exports.confirmSessionResponse = {
  id: '/confirmSessionResponse',
  schema: {
    properties: {
      status: {
        type: 'string'
      },
      tracks: {
        type: 'array'
      },
      albums: {
        type: 'array'
      },
      compilations: {
        type: 'array'
      },
    },
    required: ['status', 'tracks', 'albums', 'compilations']
  }
}

exports.processMetadataResponse = {
  id: '/processMetadataResponse',
  schema: {
    properties: {
      status: {
        type: 'string'
      },
    },
    required: ['status']
  }
}

exports.checkProgressResponse = {
  id: '/checkProgressResponse',
  schema: {
    properties: {
      tracksCompleted: {
        type: 'number'
      },
    },
    required: ['tracksCompleted']
  }
}

exports.extractTrackSourcesResponse = {
  id: '/extractTrackSourcesResponse',
  schema: {
    properties: {
      tracksCompleted: {
        type: 'number'
      },
    },
    required: ['tracksCompleted']
  }
}
