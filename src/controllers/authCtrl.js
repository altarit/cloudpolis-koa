const { HttpError, AuthError } = require('src/lib/error/index')
const userService = require('src/services/userService')
const authService = require('src/services/authService')

exports.params = {
  base: ''
}

exports.check = {
  path: 'hi',
  requestSchema: {},
  method: 'get',
  responseSchema: {
    properties: {
      'username': {
        'type': 'string'
      }
    },
    required: ['username']
  },
  handler: check
}

/**
 * Checks if there's correct non-expired and auth header and returns username.
 */
async function check (ctx) {
  const { user } = ctx.request

  if (!user) {
    throw new AuthError(401, 'Not authorized')
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
      'username': {
        'type': 'string'
      },
      'password': {
        'type': 'string'
      }
    },
    required: ['username', 'password']
  },
  method: 'post',
  handler: login
}

// TODO: handle AuthError in sendHttpError middleware
async function login (ctx) {
  const { username = '', password = '' } = ctx.request.body

  const user = await userService.authorize(username, password)
  const tokenPair = await authService.generateTokensPair(user.username)

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
      'username': {
        'type': 'string'
      },
      'password': {
        'type': 'string'
      },
      'email': {
        'type': 'string'
      },
      'additional': {
        'type': 'string'
      }
    },
    required: ['username', 'password', 'email']
  },
  method: 'post',
  handler: register
}

// TODO: handle AuthError in sendHttpError middleware
async function register (ctx) {
  const { username, password, email = '', additional = '' } = ctx.request.body

  const user = userService.register(username.trim(), password.trim(), email.trim(), additional.trim())

  const tokenPair = await authService.generateTokensPair(user.username)
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
      'username': {
        'type': 'string'
      }
    },
    required: ['username']
  },
  method: 'post',
  handler: renewAccessToken
}

async function renewAccessToken (ctx) {
  const { body } = ctx.request
  const { username } = body
  const refreshToken = ctx.headers['refresh']

  const accessToken = await authService.renewAccessToken(username, refreshToken)
  ctx.end({
    access: accessToken
  })

}


exports.renewTokenPair = {
  path: 'pair',
  requestSchema: {
    properties: {
      'username': {
        'type': 'string'
      }
    },
    required: ['username']
  },
  method: 'post',
  handler: renewTokenPair
}

async function renewTokenPair (ctx) {
  const body = ctx.request.body
  const { username } = body
  const refreshToken = ctx.headers['refresh']

  const tokenPair = await authService.renewTokenPair(username, refreshToken)
  ctx.end({
    access: tokenPair.accessToken,
    refresh: tokenPair.refreshToken,
  })
}

exports.logout = {
  path: 'logout',
  requestSchema: {
    properties: {
      'username': {
        'type': 'string'
      },
      'password': {
        'type': 'string'
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
  const { username } = ctx.request.body
  const refreshToken = ctx.headers['refresh']

  await authService.invalidateRefreshToken(username, refreshToken)
  ctx.end({
    success: true
  })
}
