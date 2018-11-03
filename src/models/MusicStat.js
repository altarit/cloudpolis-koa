const mongoose = require('src/lib/mongoose')
const defaultOptions = require('./default').options

const schema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  song: {
    type: String
  },
  user: {
    type: String
  },
  session: {
    type: String
  },
  ip: {
    type: String
  },
  referer: {
    type: String
  }
}, defaultOptions)

exports.MusicStat = mongoose.model('MusicStat', schema)
