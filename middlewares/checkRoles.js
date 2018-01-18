const HttpError = require('lib/error').HttpError;
const log = require('lib/log')(module);

module.exports = (nickname) => async function (ctx, next) {
  if (!ctx.request.user || !ctx.request.user.username) {
    throw new HttpError(401, 'Not authorized');
  } else if (nickname && ctx.request.user.username !== nickname) {
    log.debug(`Username is not ${nickname}`)
    throw new HttpError(403, 'Forbidden');
  } else {
    await next();
  }
};
