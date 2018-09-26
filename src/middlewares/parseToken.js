const log = require('src/lib/log')(module)
const authService = require('src/services/authService')

const config = require('config')
const accessExpiresInMinutes = config.accessToken.expiresInMinutes

module.exports = parseToken

async function parseToken (ctx, next) {
  const token = ctx.headers['auth']
  if (token) {
    const decoded = authService.verify(token)
    if (checkAccessTokenInfo(decoded)) {
      ctx.request.user = {
        username: decoded.username
      }
    }
  }

  await next()
}

function checkAccessTokenInfo (tokenInfo) {
  if (!tokenInfo) {
    log.verbose(`Access token is invalid.'.`)
    return false
  }

  const { username, iat } = tokenInfo
  if (!username || !iat) {
    log.debug(`Access token doesn't have some required fields: username='%s' iat='%s'.`, username, iat)
    return false
  }

  const now = Date.now() / 1000
  if (iat > now) {
    log.verbose(`Access token for user %s from the future'.`, username)
    return false
  }

  const expires = iat + 60 * 1000 * accessExpiresInMinutes
  if (now > expires) {
    log.verbose(`Access token for user %s has expired'.`, username)
  }

  return true
}
