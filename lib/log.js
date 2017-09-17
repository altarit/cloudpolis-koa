const winston = require('winston');
const ENV = process.env.NODE_ENV;

function getLogger(module) {
  const path = module.filename.split('\\').slice(-3).join('\\');
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
        level: (ENV === 'development') ? 'debug' : 'error',
        label: path,
        json: false
      })
    ]
  });
}

module.exports = getLogger;
