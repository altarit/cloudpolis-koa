const mongoose = require('src/lib/mongoose')
const defaultOptions = require('./default').options

const schema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  created: {
    type: String,
    required: true,
    default: Date.now
  },
}, defaultOptions)

exports.Library = mongoose.model('Library', schema)
