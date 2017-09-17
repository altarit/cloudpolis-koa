const Request = require('models/request').Request;
const MusicStat = require('models/musicStat').MusicStat;
const log = require('lib/log')(module);

exports.index = async function (ctx, next) {
  ctx.body = {
    api: {
      logs: '/api/admin/access_log'
    }
  };
};

exports.accesslog = async function (ctx, next) {
  let req = ctx.request;
  let url = req.query['filter-url'];
  let user = req.query['filter-user'];
  let session = req.query['filter-session'];
  let ip = req.query['filter-ip'];
  try {
    let filter = {
      url: {$regex: new RegExp(url)}
    };
    if (user) {
      if (user === '$current')
        filter.user = {$ne: req.user.username};
      else
        filter.user = {$regex: new RegExp('^' + user + '$', 'i')};
    }

    if (session) {
      if (session === '$current')
        filter.session = {$ne: ctx.sessionId};
      else
        filter.session = {$regex: new RegExp('^' + session + '$')};
    }

    if (ip) {
      if (ip === '$current')
        filter.ip = {$ne: req.headers['x-real-ip'] || req.ip};
      else
        filter.ip = {$regex: new RegExp('^' + ip + '$')};
    }

    let requests = await Request.find(filter).sort({created: -1}).limit(100).exec();
    log.debug(filter);

    ctx.body = {data: {requests: requests}};
  } catch (e) {
    throw new Error(e);
  }
};

exports.musicLog = async function (ctx, next) {
  log.debug('music_log');
  let req = ctx.request;
  let requests = await MusicStat.find({}).sort({created: -1}).limit(100).exec();
  ctx.body = {data: {requests: requests}};
};

exports.statistic = async function (ctx, next) {
  ctx.body = {
    api: {
      logs: '/api/admin/access_log'
    }
  };

};

exports.control = async function (ctx, next) {
  ctx.body = {
    api: {
      logs: '/api/admin/access_log'
    }
  };
};
