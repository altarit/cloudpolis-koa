const jwt = require('jsonwebtoken');
const config = require('config/index');

const secret = config.jwt.secret;

exports.sign = function (obj) {
  return jwt.sign(obj, secret);
}

exports.verify = function (token) {
  try {
    return jwt.verify(token, secret)
  } catch (e) {
    return null;
    //throw new HttpError(401, 'Not authorized');
  }
}

