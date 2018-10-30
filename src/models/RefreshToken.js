const util = require('util')
const log = require('src/lib/log')(module)
const mongoose = require('src/lib/mongoose')

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
})

exports.RefreshToken = mongoose.model('RefreshToken', schema)
