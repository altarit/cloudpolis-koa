const mongoose = require('src/lib/mongoose')
const defaultOptions = require('./default').options

const schema = new mongoose.Schema({
  // identity
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  // hierarchy
  library: {
    type: String
  },
  importSession: {
    type: String
  },
  compilation: {
    type: String,
    required: true
  },
  album: {
    type: String
  },
  // content
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
  search: {
    type: String
  },
  mark: {
    type: Number
  },
  rand: {
    type: Number
  },
}, defaultOptions)

exports.Song = mongoose.model('Song', schema)




