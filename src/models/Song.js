const mongoose = require('src/lib/mongoose')
const defaultOptions = require('./default').options

const schema = new mongoose.Schema({
  // identity
  id: {
    type: String,
    required: true,
    unique: true
  },
  // hierarchy
  library: {
    type: String,
    required: true
  },
  importSession: {
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
  // content
  title: {
    type: String,
    required: true
  },
  src: {
    type: String,
    required: true
  },
  sources: {
    typ: Object,
  },
  // other
  artist: {
    type: String,
    required: true
  },
  duration: {
    type: String
  },
  size: {
    type: String
  },
  mark: {
    type: Number
  },
  search: {
    type: String
  },
  rand: {
    type: Number
  },
}, defaultOptions)

exports.Song = mongoose.model('Song', schema)




