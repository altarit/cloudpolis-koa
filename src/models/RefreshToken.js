const mongoose = require('src/lib/mongoose')
const defaultOptions = require('./default').options

const schema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  token: {
    type: String
  },
  username: {
    type: String
  },
  isActive: {
    type: Boolean
  }
}, defaultOptions)

exports.RefreshToken = mongoose.model('RefreshToken', schema)
