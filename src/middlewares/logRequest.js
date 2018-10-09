const { Request } = require('src/models/request')

const log = require('src/lib/log')(module)

module.exports = async function (ctx, next) {
  const now = Date.now()

  await next()

  const responseTime = Date.now() - now
  const { method, request, response } = ctx
  const { url, headers, user, ip } = request

  log.debug('--> %s %s %sms %s', method, url, responseTime, response.status)

  const paramsPos = url.indexOf('?')
  let path, query
  if (paramsPos >= 0) {
    path = url.substring(0, paramsPos)
    if (paramsPos + 1 < url.length) {
      query = url.substr(paramsPos + 1)
    }
  } else {
    path = url
  }

  const record = new Request({
    path: path,
    query: query,
    user: user && user.username,
    session: ctx.sessionId,
    ip: headers['x-real-ip'] || ip,
    agent: headers['user-agent'],
    referer: headers['referer'],
    time: responseTime,
    status: response.status,
  })

  record.save()
}
