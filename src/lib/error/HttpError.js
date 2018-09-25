const util = require('util')
const http = require('http')

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)

    this.status = status
    this.message = message || http.STATUS_CODES[status] || "Error"
  }
}

exports.HttpError = HttpError


