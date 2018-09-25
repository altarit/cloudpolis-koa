const Request = require('src/models/request').Request
const log = require('src/lib/log')(module)

module.exports = async function (ctx, next) {
  let start = new Date()
  await next()

  let responseTime = new Date() - start
  log.debug('--> %s %s %sms %s', ctx.method, ctx.request.url, responseTime, ctx.response.status)

  let url = ctx.request.url
  let paramsPos = url.indexOf('?')
  let path, query
  if (paramsPos !== -1) {
    path = url.substring(0, paramsPos)
    if (paramsPos + 1 < url.length) {
      query = url.substr(paramsPos + 1)
    }
  } else {
    path = url
  }

  let request = new Request({
    path: path,
    query: query,
    user: ctx.request.user ? ctx.request.user.username : null,
    session: ctx.sessionId,
    ip: ctx.request.headers['x-real-ip'] || ctx.request.ip,
    agent: ctx.request.headers['user-agent'],
    referer: ctx.request.headers['referer'],
    time: responseTime,
    status: ctx.response.status,
  })

  request.save()
}

