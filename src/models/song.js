const mongoose = require('src/lib/mongoose')

const schema = new mongoose.Schema({
  id: {
    type: String,
    requred: true,
    unique: true
  },
  title: {
    type: String,
    requred: true
  },
  artist: {
    type: String,
    required: true
  },
  compilation: {
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
  sources: {
    typ: Object,
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
  rand: {
    type: Number
  },
  library: {
    type: String
  }
})

exports.Song = mongoose.model('Song', schema)




