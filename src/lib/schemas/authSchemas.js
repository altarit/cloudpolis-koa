exports.checkResponse = {
  id: '/checkResponse',
  schema: {
    properties: {
      username: {
        type: 'string'
      }
    },
    required: ['username']
  }
}

exports.loginRequest = {
  id: '/loginRequest',
  schema: {
    properties: {
      username: {
        type: 'string'
      },
      password: {
        type: 'string'
      }
    },
    required: ['username', 'password']
  }
}

exports.loginResponse = {
  id: '/loginResponse',
  schema: {
    properties: {
      username: {
        type: 'string'
      },
      access: {
        type: 'string'
      },
      refresh: {
        type: 'string'
      }
    },
    required: ['username', 'access', 'refresh']
  }
}

exports.registerRequest = {
  id: '/registerRequest',
  schema: {
    properties: {
      username: {
        type: 'string'
      },
      password: {
        type: 'string'
      },
      email: {
        type: 'string'
      },
      additional: {
        type: 'string'
      }
    },
    required: ['username', 'password', 'email']
  }
}

exports.registerResponse = {
  id: '/registerResponse',
  schema: {
    properties: {
      username: {
        type: 'string'
      },
      access: {
        type: 'string'
      },
      refresh: {
        type: 'string'
      }
    },
    required: ['username', 'access', 'refresh']
  }
}


exports.renewAccessTokenRequest = {
  id: '/renewAccessTokenRequest',
  schema: {
    properties: {
      username: {
        type: 'string'
      }
    },
    required: ['username']
  }
}

exports.renewAccessTokenResponse = {
  id: '/renewAccessTokenResponse',
  schema: {
    properties: {
      access: {
        type: 'string'
      }
    },
    required: ['access']
  }
}

exports.renewTokenPairRequest = {
  id: '/renewTokenPairRequest',
  schema: {
    properties: {
      username: {
        type: 'string'
      }
    },
    required: ['username']
  }
}

exports.renewTokenPairResponse = {
  id: '/renewTokenPairResponse',
  schema: {
    properties: {
      access: {
        type: 'string'
      },
      refresh: {
        type: 'string'
      }
    },
    required: ['access', 'refresh']
  }
}

exports.logoutRequest = {
  id: '/logoutRequest',
  schema: {
    properties: {
      username: {
        type: 'string'
      }
    },
    required: ['username']
  }
}
