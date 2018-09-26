const jwt = require('jsonwebtoken')
const config = require('config/index')
const RefreshToken = require('src/models/refreshToken').RefreshToken
const AuthError = require('src/lib/error/AuthError').AuthError
const log = require('src/lib/log')(module)

const accessSecret = config.accessToken.secret
const accessExpiresInMinutes = config.accessToken.expiresInMinutes
const refreshSecret = config.refreshToken.secret
const refreshExpiresInMinutes = config.refreshToken.expiresInMinutes

exports.generateTokensPair = async function (username) {
  const accessToken = await this.generateAccessToken(username)
  const refreshToken = await this.generateRefreshToken(username)

  return {
    accessToken: accessToken,
    refreshToken: refreshToken.token
  }
}

exports.generateRefreshToken = async function (username) {
  const now = new Date();
  const refreshToken = new RefreshToken({
    created: now,
    expires: now + 60 * 1000 * refreshExpiresInMinutes,
    username: username,
    token: 'token-' + now + '-' + Math.random(),
    isActive: true
  })
  await refreshToken.save()
  return refreshToken
}

exports.generateAccessToken = async function (username) {
  return jwt.sign({
    username: username
  }, accessSecret)
}

exports.renewAccessToken = async function (username, refreshToken) {
  const refreshTokenEntiry = await this.checkRefreshToken(username, refreshToken)
  if (!refreshTokenEntiry) {
    throw new AuthError('Refresh token not found')
  }
  return await this.generateAccessToken(username)
}

exports.checkRefreshToken = async function (username, refreshToken) {
  const now = new Date();
  const found = await RefreshToken.findOne({ username: username, token: refreshToken, isActive: true })
  if (found && found.token) {
    return refreshToken
  } else {
    return null
  }
}

exports.invalidateRefreshToken = async function (username, refreshToken) {
  log.debug(`invalidateRefreshToken for ${username}`)
  const updated = await RefreshToken.update(
    { username: username, token: refreshToken, isActive: true },
    { isActive: false })
  if (!updated.n) {
    throw new AuthError(`Refresh token is not valid or expired`)
  }
  log.debug(`Deactivated refresh token`)
}

exports.renewTokenPair = async function (username, refreshToken) {
  await this.invalidateRefreshToken(username, refreshToken)
  return await this.generateTokensPair(username)
}

exports.sign = function (obj) {
  return jwt.sign(obj, accessSecret)
}

exports.verify = function (token) {
  try {
    return jwt.verify(token, accessSecret)
  } catch (e) {
    log.error(`Error at verifying jwt token`, e)
    return null
    //throw new HttpError(401, 'Not authorized');
  }
}
