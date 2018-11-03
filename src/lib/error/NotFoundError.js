const http = require('http')

class NotFoundError extends Error {
  constructor (message = http.STATUS_CODES[404]) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)

    this.status = 404
    this.message = message
  }
}

exports.NotFoundError = NotFoundError
