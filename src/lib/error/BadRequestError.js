class BadRequestError extends Error {
  constructor (message, property, schema) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)

    this.status = 400
    this.code = 1
    this.message = message
    this.payload = { property, schema }
  }
}

exports.BadRequestError = BadRequestError
