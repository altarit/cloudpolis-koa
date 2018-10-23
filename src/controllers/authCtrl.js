const { HttpError, AuthError } = require('src/lib/error/index')
const userService = require('src/services/userService')
const authService = require('src/services/authService')

exports.params = {
  base: ''
}

exports.renewAccessToken = renewAccessToken
exports.renewTokenPair = renewTokenPair

exports.check = {
  path: 'hi',
  schema: {},
  method: 'get',
  handler: check
}

/**
 *
 * @param ctx
 * @returns {Promise<void>}
 */
async function check (ctx) {
  const { user } = ctx.request

  if (user) {
    const { username } = user
    ctx.body = {
      data: {
        username
      }
    }
  } else {
    throw new HttpError(401, 'Not authorized')
  }
}


exports.login = {
  path: 'login',
  schema: {
    'username': {
      'type': 'string'
    },
    'password': {
      'type': 'string'
    }
  },
  required: ['username', 'password'],
  method: 'post',
  handler: auth
}

async function auth (ctx) {
  const { username = '', password = '', email = '', additional = '', isreg = false } = ctx.request.body

  try {
    let user = isreg
      ? await userService.register(username.trim(), password.trim(), email.trim(), additional.trim())
      : await userService.authorize(username, password)
    const tokenPair = await authService.generateTokensPair(user.username)
    ctx.body = {
      data: {
        username: user.username,
        access: tokenPair.accessToken,
        refresh: tokenPair.refreshToken,
      }
    }
  } catch (err) {
    if (err instanceof AuthError) {
      throw new HttpError(401, err.message)
    } else {
      throw err
    }
  }
}

async function renewAccessToken (ctx) {
  const { body } = ctx.request
  const { username } = body
  const refreshToken = ctx.headers['refresh']

  try {
    const accessToken = await authService.renewAccessToken(username, refreshToken)
    ctx.body = {
      data: {
        access: accessToken
      }
    }
  } catch (err) {
    if (err instanceof AuthError) {
      throw new HttpError(401, err.message)
    } else {
      throw err
    }
  }
}

async function renewTokenPair (ctx) {
  const body = ctx.request.body
  const { username } = body
  const refreshToken = ctx.headers['refresh']

  try {
    const tokenPair = await authService.renewTokenPair(username, refreshToken)
    ctx.body = {
      data: {
        access: tokenPair.accessToken,
        refresh: tokenPair.refreshToken,
      }
    }
  } catch (err) {
    if (err instanceof AuthError) {
      throw new HttpError(401, err.message)
    } else {
      throw err
    }
  }
}

exports.logout = {
  path: 'logout',
  schema: {
    'username': {
      'type': 'string'
    },
    'password': {
      'type': 'string'
    }
  },
  required: ['username'],
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
  try {
    await authService.invalidateRefreshToken(username, refreshToken)
    ctx.body = {
      data: {
        success: true
      }
    }
  } catch (err) {
    if (err instanceof AuthError) {
      throw new HttpError(401, err.message)
    } else {
      throw err
    }
  }
}
