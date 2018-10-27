const { HttpError } = require('./HttpError')
const { AuthError } = require('./AuthError')
const { BadRequestError } = require('./BadRequestError')
const { ServerError } = require('./ServerError')

exports.HttpError = HttpError
exports.AuthError = AuthError
exports.BadRequestError = BadRequestError
exports.ServerError = ServerError
