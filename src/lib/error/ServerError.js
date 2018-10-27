class ServerError extends Error {
  constructor (message = 'Server Error') {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)

    this.status = 500
    this.message = message
  }
}

exports.ServerError = ServerError
