const { AuthError } = require('src/lib/error')
const userService = require('src/services/userService')
const tokenService = require('src/services/tokenService')
const log = require('src/lib/log')(module)

exports.params = {
  name: 'auth',
  base: ''
}

exports.check = {
  path: 'hi',
  description: 'Checks if there\'s correct non-expired and auth header and returns username.',
  requestSchema: {},
  method: 'get',
  responseSchema: {
    properties: {
      username: {
        type: 'string'
      }
    },
    required: ['username']
  },
  handler: check
}

async function check (ctx) {
  const { user } = ctx.request

  if (!user) {
    throw new AuthError()
  }

  const { username } = user
  ctx.end({
    username
  })
}

exports.login = {
  path: 'login',
  requestSchema: {
    properties: {
      username: {
        type: 'string'
      },
      password: {
        type: 'string'
      }
    },
    required: ['username', 'password']
  },
  method: 'post',
  responseSchema: {
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
  },
  handler: login
}

async function login (ctx) {
  const { username = '', password = '' } = ctx.request.body

  const user = await userService.authorize(username, password)
  const tokenPair = await tokenService.generateTokensPair(user.username)

  ctx.end({
    username: user.username,
    access: tokenPair.accessToken,
    refresh: tokenPair.refreshToken,
  })
}

exports.register = {
  path: 'register',
  requestSchema: {
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
  },
  method: 'post',
  responseSchema: {
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
  },
  handler: register
}

async function register (ctx) {
  const { username, password, email = '', additional = '' } = ctx.request.body

  const user = await userService.register(username.trim(), password.trim(), email.trim(), additional.trim())
  const tokenPair = await tokenService.generateTokensPair(user.username)

  ctx.end({
    username: user.username,
    access: tokenPair.accessToken,
    refresh: tokenPair.refreshToken,
  })
}

exports.renewAccessToken = {
  path: 'access',
  requestSchema: {
    properties: {
      username: {
        type: 'string'
      }
    },
    required: ['username']
  },
  method: 'post',
  responseSchema: {
    properties: {
      access: {
        type: 'string'
      }
    },
    required: ['access']
  },
  handler: renewAccessToken
}

async function renewAccessToken (ctx) {
  const { body } = ctx.request
  const { username } = body
  const refreshToken = ctx.headers['refresh']

  const accessToken = await tokenService.renewAccessToken(username, refreshToken)

  ctx.end({
    access: accessToken
  })
}

exports.renewTokenPair = {
  path: 'pair',
  requestSchema: {
    properties: {
      username: {
        type: 'string'
      }
    },
    required: ['username']
  },
  method: 'post',
  responseSchema: {
    properties: {
      access: {
        type: 'string'
      },
      refresh: {
        type: 'string'
      }
    },
    required: ['access', 'refresh']
  },
  handler: renewTokenPair
}

async function renewTokenPair (ctx) {
  const body = ctx.request.body
  const { username } = body
  const refreshToken = ctx.headers['refresh']

  const tokenPair = await tokenService.renewTokenPair(username, refreshToken)
  ctx.end({
    access: tokenPair.accessToken,
    refresh: tokenPair.refreshToken,
  })
}

exports.logout = {
  path: 'logout',
  requestSchema: {
    properties: {
      username: {
        type: 'string'
      }
    },
    required: ['username']
  },
  method: 'post',
  handler: logout
}

/**
 * Removes current user auth data from server.
 *
 */
async function logout (ctx) {
  const { user } = ctx.request
  const refreshToken = ctx.headers['refresh']

  if (!user) {
    throw new AuthError()
  }

  await tokenService.invalidateRefreshToken(user.username, refreshToken)

  ctx.end({
    success: true
  })
}
