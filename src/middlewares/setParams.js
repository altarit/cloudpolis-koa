const log = require('src/lib/log')(module)

const config = require('config')

const { http } = config
const { cors, disableCache } = http
const { enabled: enableCors, origin } = cors

module.exports = setParams

async function setParams (ctx, next) {
  if (enableCors) {
    ctx.set('Access-Control-Allow-Origin', origin)
    ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
    ctx.set('Access-Control-Allow-Credentials', true)
    ctx.set('Access-Control-Max-Age', '86400') // 24 hours
    ctx.set('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, ' +
      'Auth, Refresh, Auth-Error')
    if (ctx.method === 'OPTIONS') {
      ctx.status = 200
      ctx.body = 'CORS'
    }
  }

  if (disableCache) {
    ctx.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    ctx.set('Expires', '-1')
    ctx.set('Pragma', 'no-cache')
  }

  ctx.end = end
  await next()
}

function end (payload) {
  if (payload) {
    this.body = {
      data: payload
    }
  }
}
