const http = require('http')

class AuthError extends Error {
  constructor (message = http.STATUS_CODES[401]) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)

    this.status = 401
    this.message = message
  }
}

exports.AuthError = AuthError
