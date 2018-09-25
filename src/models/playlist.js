const mongoose = require('src/lib/mongoose')

let schema = new mongoose.Schema({
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
})

exports.Playlist = mongoose.model('Playlist', schema)




