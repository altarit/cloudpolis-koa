const fs = require('fs')
const path = require('path')

const { createLogger, format, transports } = require('winston')
const { printf } = format

const config = require('config')
const dirPath = config.logs.dirPath
const ENV = process.env.NODE_ENV

module.exports = getLogger
module.exports.prepareLogger = prepareLogger

const myFormat = loggerName => printf(info => {
  const d = new Date()
  const date =
    d.getDate().toString().padStart(2, '0') + '.' +
    (d.getMonth() + 1).toString().padStart(2, '0') + '.' +
    d.getFullYear().toString().padStart(2, '0') + ' ' +
    d.getHours().toString().padStart(2, '0') + ':' +
    d.getMinutes().toString().padStart(2, '0') + ':' +
    d.getSeconds().toString().padStart(2, '0') + '.' +
    d.getMilliseconds().toString().padEnd(3, '0')
  return `${loggerName.slice(-32).padStart(32)} ${date} [${info.level}] ${info.message}`
})

function getLogger (module) {
  const loggerName = module.filename ? module.filename.split('\\').slice(-3).join('\\') : module
  return createLogger({
    transports: [
      new transports.Console({
        level: (ENV === 'development') ? 'debug' : 'info',
        format: myFormat(loggerName)
      }),
      new transports.File({
        level: (ENV === 'development') ? 'debug' : 'verbose',
        format: myFormat(loggerName),
        filename: path.resolve(dirPath, 'cloudpolis.log')
      })
    ]
  })
}

function prepareLogger (module) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }

  return getLogger(module)
}
