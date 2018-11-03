const mongoose = require('mongoose')
const config = require('config/index')
const ObjectId = mongoose.Types.ObjectId

const props = config.mongoose
const auth = props.username ? `${props.username}:${props.password}@` : ''
const uri = `mongodb://${auth}${props.host}:${props.port}/${props.database}`
mongoose.connect(uri)

module.exports = mongoose

module.exports.getIdString = function () {
  const objectId = new ObjectId()
  return objectId
}
