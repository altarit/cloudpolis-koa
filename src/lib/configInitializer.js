const yaml = require('js-yaml')
const fs = require('fs')

const config = require('config')

exports.initConfig = initConfig
exports.initConfigFile = initConfigFile

function initConfig (env = 'dev') {
  return initConfigFile(`config/${env}.config.yml`, 'utf8')
}

function initConfigFile (path) {
  const doc = yaml.safeLoad(fs.readFileSync(path, 'utf8'))

  Object.assign(config, doc)
  return config
}
