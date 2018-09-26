const log = require('src/lib/log')(module)

module.exports = async function (ctx, next) {
  try {
    await next()
  } catch (err) {
    const errTypeof = typeof err

    if (errTypeof !== 'object') {
      log.info(`Error '%s' typeof '%s'. Investigate and fix it.`, err, errTypeof)
      ctx.response.status = 500
      ctx.body = {
        status: 500,
        error: {
          message: 'Unknown error (type error)'
        }
      }
      return
    }

    log.stackTrace(`sendHttpError [${err.status}/${err.code || 0}]:`, err)
    if (!err.status) {
      log.error(`ErrorStatus is undefined`,)
    }
    if (!err.message) {
      log.error(`ErrorMessage is undefined`,)
    }

    const { status = 500, code = 0, message = 'Unknown error (undefined message)' } = err

    ctx.response.status = status
    ctx.body = {
      status,
      error: {
        code,
        message
      }
    }
  }
}
