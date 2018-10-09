const { HttpError, AuthError } = require('src/lib/error')
const userService = require('src/services/userService')
const log = require('src/lib/log')(module)

exports.getUsers = getUsers
exports.getDetails = getDetails
exports.updateUser = updateUser

async function getUsers (ctx) {
  const found = await userService.getList()
  ctx.body = {
    data: found
  }
}

async function getDetails (ctx) {
  const req = ctx.request
  const id = ctx.params.id
  const user = await userService.getDetails(id)
  if (user) {
    ctx.body = {
      data: user
    }
  } else {
    throw new HttpError(404, "User not found.")
  }
}

async function updateUser (ctx) {
  const req = ctx.request
  const id = ctx.params.id
  if (!ctx.locals.user.username || ctx.locals.user.username != id)
    throw new HttpError(403, "Access denied")

  const oldpassword = req.body.oldpassword
  const newpassword = req.body.newpassword
  const additional = req.body.additional

  try {
    const user = await userService.edit(id, oldpassword, newpassword, 'email', additional)
    ctx.body = {
      data: user
    }
  } catch (err) {
    if (err instanceof AuthError) {
      throw new HttpError(403, err.message)
    } else {
      throw err
    }
  }
}
