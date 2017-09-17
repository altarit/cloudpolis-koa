const HttpError = require('lib/error').HttpError;
const log = require('lib/log')(module);

module.exports = async function (ctx, next) {
  if (!ctx.request.user || ctx.request.user.username !== 'Q') {
    throw new HttpError(401, 'Вы не авторизованы');
  } else {
    await next();
  }
};
