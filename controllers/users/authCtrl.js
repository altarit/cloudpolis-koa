const HttpError = require('lib/error').HttpError;
const AuthError = require('lib/error/AuthError').AuthError;
const log = require('lib/log')(module);
const UserService = require('services/userService');
const jwtUtils = require('services/authService');

exports.auth = async function (ctx, next) {
  console.log('!!! auth !!!')
  let req = ctx.request;
  let username = req.body.username ? req.body.username.trim() : '';
  let password = req.body.password ? req.body.password.trim() : '';
  let email = req.body.email ? req.body.email.trim() : '';
  let additional = req.body.additional ? req.body.additional.trim() : '';
  let registration = req.body.isreg;

  try {
    let user = registration
      ? await UserService.register(username, password, email, additional)
      : await UserService.authorize(username, password);
    const token = jwtUtils.sign({
      username: user.username,
      id: user._id,
      email: user.email
    });
    ctx.set("Auth", token);
    ctx.body = {data: user.username};
  } catch (err) {
    if (err instanceof AuthError) {
      throw new HttpError(401, err.message);
    } else {
      throw err;
    }
  }
};

exports.check = async function (ctx, next) {
  if (ctx.request.user) {
    const username = ctx.request.user.username
    const token = jwtUtils.sign({
      username: username
    });
    ctx.set("Auth", token);
    ctx.body = {data: username};
  } else {
    throw new HttpError(401, 'Not authorized');
  }
};

exports.logout = async function (ctx, next) {
  let sid = ctx.sessionId;
  ctx.session = null;
  ctx.body = {result: true};
};
