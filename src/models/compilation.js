const mongoose = require('src/lib/mongoose')

let schema = new mongoose.Schema({
  id: {
    type: String,
    required: true
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
  library: {
    type: String,
    required: true
  },
  import: {
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




