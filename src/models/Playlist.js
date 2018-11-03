const mongoose = require('src/lib/mongoose')
const defaultOptions = require('./default').options

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: false
  },
  owner: {
    type: String,
    required: true,
    unique: false
  },
  tracks: {
    type: Object
  }
}, defaultOptions)

exports.Playlist = mongoose.model('Playlist', schema)




