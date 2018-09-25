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




