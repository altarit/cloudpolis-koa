const mongoose = require('src/lib/mongoose')

const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  lyrics: {
    type: String
  }
})

exports.SongInfo = mongoose.model('SongInfo', schema)
