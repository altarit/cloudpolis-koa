const http = require('http')

class ForbiddenError extends Error {
  constructor (message = http.STATUS_CODES[403]) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)

    this.status = 403
    this.message = message
  }
}

exports.ForbiddenError = ForbiddenError
