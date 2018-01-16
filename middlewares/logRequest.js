const Request = require('models/request').Request;
const log = require('lib/log')(module);

module.exports = async function (ctx, next) {
  let start = new Date();
  await next();

  let responseTime = new Date() - start;
  console.info('--> %s %s %sms %s', ctx.method, ctx.request.url, responseTime, ctx.response.status);
  let request = new Request({
    url: ctx.request.url,
    body: ctx.request.body,
    user: ctx.request.user ? ctx.request.user.username : null,
    session: ctx.sessionId,
    ip: ctx.request.headers['x-real-ip'] || ctx.request.ip,
    agent: ctx.request.headers['user-agent'],
    referer: ctx.request.headers['referer'],
    time: responseTime,
    status: ctx.response.status,
    response: ctx.request.isLogNeeded ? ctx.body : {}
  });

  await request.save();
};

