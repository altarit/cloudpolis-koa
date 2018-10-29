const mongoose = require('src/lib/mongoose')

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
    type: String,
    required: true,
    default: Date.now
  },
  // hierarchy
  library: {
    type: String,
    required: true
  },
  import: {
    type: String,
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
})

exports.Compilation = mongoose.model('Compilation', schema)
