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

  const { username, created } = tokenInfo
  if (!username || !created) {
    log.debug(`Access token doesn't have some required fields: username='${username}' created='${created}'.`)
    return false
  }

  const now = Date.now()
  if (created < now) {
    log.verbose(`Access token for user ${username} from the future'.`)
    return false
  }

  if (now < created) {
    log.verbose(`Access token for user ${username} from the future'.`)
    return false
  }

  const expires = created + 60 * 1000 * accessExpiresInMinutes
  if (now > expires) {
    log.verbose(`Access token for user ${username} has expired'.`)
  }

  return true
}
