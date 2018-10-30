const mongoose = require('src/lib/mongoose')
const defaultOptions = require('./default').options

const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  lyrics: {
    type: String
  }
}, defaultOptions)

exports.SongInfo = mongoose.model('SongInfo', schema)
