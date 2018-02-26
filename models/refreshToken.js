const util = require('util')
const log = require('lib/log')(module)
const mongoose = require('lib/mongoose')

let schema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  token: {
    type: String
  },
  expires: {
    type: Date
  },
  user: {
    type: String
  }
})

exports.Request = mongoose.model('RefreshToken', schema)




