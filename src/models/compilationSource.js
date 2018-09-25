const mongoose = require('src/lib/mongoose')

let schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  library: {
    type: String,
    required: true
  },
  cover: {
    type: String
  }
})

exports.CompilationSource = mongoose.model('CompilationSource', schema)
