const mongoose = require('src/lib/mongoose')

let schema = new mongoose.Schema({
  id: {
    type: String,
    unique: false,
    required: true
  },
  name: {
    type: String,
    unique: false,
    required: true
  }
})

exports.Library = mongoose.model('Library', schema)
