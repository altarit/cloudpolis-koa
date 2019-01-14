const mongoose = require('src/lib/mongoose')
const defaultOptions = require('./default').options

const schema = new mongoose.Schema({
  // identity
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  // hierarchy
  library: {
    type: String,
    required: true
  },
  importSession: {
    type: Object,
    required: true
  },
  // content
  songs: {
    type: Object
  },
  count: {
    type: Number
  },
  rating: {
    type: Number
  },
  cover: {
    type: String
  }
}, defaultOptions)

exports.Compilation = mongoose.model('Compilation', schema)
