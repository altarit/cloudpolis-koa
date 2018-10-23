const mongoose = require('src/lib/mongoose')

const schema = new mongoose.Schema({
  preId: {
    type: String,
    required: true
  },
  importSession: {
    type: String,
    required: true
  },
  library: {
    type: String,
    required: true
  },
  compilation: {
    type: String
  },
  title: {
    type: String,
    requred: true
  },
  album: {
    type: String
  },
  coauthors: {
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
})

exports.SongSource = mongoose.model('SongSource', schema)
