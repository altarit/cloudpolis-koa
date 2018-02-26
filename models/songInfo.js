const mongoose = require('lib/mongoose')

const schema = new mongoose.Schema({
  id: {
    type: String,
    requred: true,
    unique: true
  },
  lyrics: {
    type: String
  }
})

exports.SongInfo = mongoose.model('SongInfo', schema)
