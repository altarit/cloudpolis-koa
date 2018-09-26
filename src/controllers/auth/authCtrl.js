const HttpError = require('src/lib/error/index').HttpError
const AuthError = require('src/lib/error/AuthError').AuthError
const log = require('src/lib/log')(module)
const UserService = require('src/services/userService')
const authService = require('src/services/authService')

exports.auth = auth
exports.renewAccessToken = renewAccessToken
exports.renewTokenPair = renewTokenPair
exports.check = check
exports.logout = logout

async function auth (ctx, next) {
  console.log('!!! auth !!!')
  let req = ctx.request
  let username = req.body.username ? req.body.username.trim() : ''
  let password = req.body.password ? req.body.password.trim() : ''
  let email = req.body.email ? req.body.email.trim() : ''
  let additional = req.body.additional ? req.body.additional.trim() : ''
  let registration = req.body.isreg

  try {
    let user = registration
      ? await UserService.register(username, password, email, additional)
      : await UserService.authorize(username, password)
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

async function renewAccessToken (ctx, next) {
  const body = ctx.request.body
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

async function renewTokenPair (ctx, next) {
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

async function check (ctx, next) {
  if (ctx.request.user) {
    const username = ctx.request.user.username
    const token = authService.sign({
      username: username
    })
    //ctx.set("Auth", token);
    ctx.body = {
      data: {
        username
      }
    }
  } else {
    throw new HttpError(401, 'Not authorized')
  }
}

async function logout (ctx, next) {
  let sid = ctx.sessionId
  ctx.session = null
  ctx.body = { result: true }
}
