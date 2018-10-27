const { HttpError } = require('./HttpError')
const { AuthError } = require('./AuthError')
const { BadRequestError } = require('./BadRequestError')
const { ServerError } = require('./ServerError')
const { NotFoundError } = require('./NotFoundError')

exports.HttpError = HttpError
exports.AuthError = AuthError
exports.BadRequestError = BadRequestError
exports.NotFoundError = NotFoundError
exports.ServerError = ServerError
