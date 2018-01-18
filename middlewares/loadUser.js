const jwtUtils = require('services/authService');

module.exports = async function (ctx, next) {
  const token = ctx.headers['auth'];
  if (token) {
    const decoded = jwtUtils.verify(token);
    if (decoded && decoded.username) {
      ctx.request.user = decoded
    }
  }
  await next();
};
