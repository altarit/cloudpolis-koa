const mongoose = require('src/lib/mongoose')

const schema = new mongoose.Schema({
  id: {
    type: String,
    unique: false,
    required: true
  },
  name: {
    type: String,
    unique: true,
    required: true
  }
})

exports.Library = mongoose.model('Library', schema)
