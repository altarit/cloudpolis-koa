const mongoose = require('lib/mongoose')

const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  library: {
    type: String,
    required: true
  },
  compilation: {
    type: String,
    required: true
  },
  title: {
    type: String,
    requred: true
  },
  artist: {
    type: String,
    required: true
  },
  album: {
    type: String
  },
  src: {
    type: String,
    requred: true
  },
  duration: {
    type: String
  },
  size: {
    type: String
  },
  search: {
    type: String
  },
  mark: {
    type: Number
  },
})

exports.SongSource = mongoose.model('SongSource', schema)
