const jwtUtils = require('src/services/authService')
const log = require('src/lib/log')(module)
const config = require('config/index')

const accessExpiresInMinutes = config.accessToken.expiresInMinutes

module.exports = async function (ctx, next) {
  const token = ctx.headers['auth']
  if (token) {
    const now = Date.now()
    const decoded = jwtUtils.verify(token)
    if (decoded) {
      const { username, created } = decoded
      if (username && created && now < created + 60 * 1000 * accessExpiresInMinutes) {
        ctx.request.user = {
          username: username
        }
      } else {
        log.debug(`Access token is invalid or expired`)
      }
    }
  }
  await next()
}
