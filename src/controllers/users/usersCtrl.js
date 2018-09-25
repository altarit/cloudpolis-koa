const HttpError = require('src/lib/error/index').HttpError;
const AuthError = require('src/lib/error/AuthError').AuthError;
const UserService = require('src/services/userService');

exports.getUsers = async function (ctx, next) {
  let found = await UserService.getList();
  ctx.body = {data: found};
};

exports.getDetails = async function (ctx, next) {
  let req = ctx.request;
  let id = ctx.params.id;
  let user = await UserService.getDetails(id);
  if (user) {
    ctx.body = {data: user};
  } else {
    throw new HttpError(404, "User not found.");
  }
};

exports.updateUser = async function (ctx, next) {
  let req = ctx.request;
  let id = ctx.params.id;
  if (!ctx.locals.user.username || ctx.locals.user.username != id)
    throw new HttpError(403, "Access denied");

  let oldpassword = req.body.oldpassword;
  let newpassword = req.body.newpassword;
  let additional = req.body.additional;

  try {
    let user = await UserService.edit(id, oldpassword, newpassword, 'email', additional);
    ctx.body = {data: user};
  } catch (err) {
    if (err instanceof AuthError) {
      throw new HttpError(403, err.message);
    } else {
      throw err;
    }
  }
};
