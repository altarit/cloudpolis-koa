const User = require('models/user').User;

module.exports = async function (ctx, next) {
  ctx.request.user = ctx.locals.user = null;

  if (!ctx.session.user) return await next();
  let user = await User.findById(ctx.session.user);
  ctx.request.user = ctx.locals.user = user;

  await next();
};
