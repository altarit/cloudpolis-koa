const jwt = require('jsonwebtoken')

const { RefreshToken } = require('src/models/refreshToken')
const { AuthError } = require('src/lib/error')
const log = require('src/lib/log')(module)

const config = require('config/index')
const accessSecret = config.accessToken.secret
const refreshSecret = config.refreshToken.secret
const refreshExpiresInMinutes = config.refreshToken.expiresInMinutes

exports.generateTokensPair = generateTokensPair
exports.renewTokenPair = renewTokenPair
exports.generateAccessToken = generateAccessToken
exports.renewAccessToken = renewAccessToken
exports.verifyAccessToken = verifyAccessToken
exports.invalidateRefreshToken = invalidateRefreshToken

/* public methods */

async function generateTokensPair (username) {
  const accessToken = await generateAccessToken(username)
  const refreshToken = await generateRefreshToken(username)

  return {
    accessToken: accessToken,
    refreshToken: refreshToken.token
  }
}

async function renewTokenPair (username, refreshToken) {
  await invalidateRefreshToken(username, refreshToken)
  return await generateTokensPair(username)
}

async function generateAccessToken (username) {
  return jwt.sign({
    username: username
  }, accessSecret)
}

async function renewAccessToken (username, refreshToken) {
  const refreshTokenEntry = await checkRefreshToken(username, refreshToken)

  if (!refreshTokenEntry) {
    throw new AuthError('Refresh token not found')
  }
  return await this.generateAccessToken(username)
}

async function verifyAccessToken (token) {
  try {
    return jwt.verify(token, accessSecret)
  } catch (e) {
    log.error(`Error at verifying jwt token`, e)
    return null
  }
}

async function invalidateRefreshToken (username, refreshToken) {
  log.debug(`invalidateRefreshToken for ${username}`)
  const updated = await RefreshToken.update({
    username: username,
    token: refreshToken,
    isActive: true
  }, {
    isActive: false
  })
  if (!updated.n) {
    throw new AuthError(`Refresh token is not valid or expired`)
  }
  log.debug(`Deactivated refresh token`)
}

/* private methods */

async function generateRefreshToken (username) {
  const now = new Date()
  const refreshToken = new RefreshToken({
    created: now,
    username: username,
    token: 'token-' + now + '-' + Math.random(),
    isActive: true
  })
  await refreshToken.save()
  return refreshToken
}

async function checkRefreshToken (username, refreshToken) {
  const now = new Date()
  const found = await RefreshToken.findOne({
    username: username,
    token: refreshToken,
    isActive: true
  })
  if (found && found.token) {
    return refreshToken
  } else {
    return null
  }
}
