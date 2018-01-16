const jwt = require('jsonwebtoken');

module.exports = async function (ctx, next) {
  const token = ctx.headers['auth'];
  if (token) {
    const decoded = jwt.verify(token, 'shhhhh');
    if (decoded && decoded.username) {
      ctx.request.user = decoded
    }
  }
  await next();
};
