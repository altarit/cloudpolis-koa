const { HttpError, AuthError, NotFoundError, ForbiddenError } = require('src/lib/error')
const userService = require('src/services/userService')
const log = require('src/lib/log')(module)

exports.getUsers = getUsers
exports.getDetails = getDetails
exports.updateUser = updateUser

async function getUsers (ctx) {
  const found = await userService.getList()

  ctx.end({
    users: found
  })
}

async function getDetails (ctx) {
  const { id } = ctx.params
  const user = await userService.getDetails(id)

  if (!user) {
    throw new NotFoundError('User not found.')
  }

  ctx.end({
    user: user
  })
}

async function updateUser (ctx) {
  const { request, params, user } = ctx.request
  const { id } = params

  if (!user || user.username || user.user.username !== id) {
    throw new ForbiddenError()
  }

  const { oldpassword, newpassword, additional } = request.body

  const updatedUser = await userService.edit(id, oldpassword, newpassword, 'email', additional)

  ctx.end({
    user: updatedUser
  })
}
