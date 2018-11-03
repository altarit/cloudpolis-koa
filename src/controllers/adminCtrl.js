const { Request, MusicStat } = require('src/models')
const log = require('src/lib/log')(module)

exports.index = async function (ctx, next) {
  ctx.body = {
    api: {
      logs: '/api/admin/access_log'
    }
  }
}

exports.accesslog = async function (ctx, next) {
  let req = ctx.request
  let url = req.query.url
  let limit = +(req.query.limit || 50)
  if (limit > 200) {
    limit = 200
  }
  let page = +(req.query.page || 0)
  let skip = page * limit
  let user = req.query.user
  let excludeMe = req.query['exclude-user-me']
  let ip = req.query.ip
  let excludeMyIp = req.query['exclude-ip-me']


  try {
    let filter = {}

    if (url) {
      filter.path = { $regex: new RegExp(url) }
    }

    if (user || excludeMe === 'true') {
      filter.user = {}
      if (excludeMe === 'true') {
        //log.debug(`!excludeMe=${excludeMe}`)
        filter.user['$nin'] = [req.user.username]
      }
      if (user) {
        filter.user['$in'] = [user]
      }
    }

    if (ip || excludeMyIp === 'true') {
      filter.ip = {}
      if (excludeMyIp === 'true') {
        //log.debug(`!excludeMe=${excludeMe}`)
        filter.ip['$nin'] = [ctx.request.headers['x-real-ip'] || ctx.request.ip]
        //req.headers['x-real-ip'] || req.ip
      }
      if (ip) {
        filter.ip['$in'] = [ip]
      }
    }
    let requests = await Request.find(filter).sort({ created: -1 }).skip(skip).limit(limit).exec()

    ctx.body = { data: { requests: requests } }
  } catch (e) {
    log.error(`Error at getting access logs`, e)
    throw new Error(e)
  }
}

exports.musicLog = async function (ctx, next) {
  log.debug('music_log')
  let req = ctx.request
  let requests = await MusicStat.find({}).sort({ created: -1 }).limit(100).exec()
  ctx.body = { data: { requests: requests } }
}

exports.statistic = async function (ctx, next) {
  ctx.body = {
    api: {
      logs: '/api/admin/access_log'
    }
  }

}

exports.control = async function (ctx, next) {
  ctx.body = {
    api: {
      logs: '/api/admin/access_log'
    }
  }
}
