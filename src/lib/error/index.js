const { AuthError } = require('./AuthError')
const { BadRequestError } = require('./BadRequestError')
const { ForbiddenError } = require('./ForbiddenError')
const { HttpError } = require('./HttpError')
const { NotFoundError } = require('./NotFoundError')
const { ServerError } = require('./ServerError')

exports.AuthError = AuthError
exports.BadRequestError = BadRequestError
exports.ForbiddenError = ForbiddenError
exports.HttpError = HttpError
exports.NotFoundError = NotFoundError
exports.ServerError = ServerError
