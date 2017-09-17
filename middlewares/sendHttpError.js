const log = require('lib/log')(module);
const HttpError = require('lib/error').HttpError;

module.exports = async function (ctx, next) {
  try {
    await next();
  } catch (err) {
    if (typeof err == 'number') {
      log.debug('!number');
      err = new HttpError(err);
    }

    //console.log(err.prototype.name);
    log.error(err);

    ctx.response.status = err.status || 500;
    ctx.body = err;
  }
};
