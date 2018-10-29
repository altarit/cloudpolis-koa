const mongoose = require('src/lib/mongoose')

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
})

exports.MusicStat = mongoose.model('MusicStat', schema)
