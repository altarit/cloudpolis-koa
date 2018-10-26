const mongoose = require('src/lib/mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now
  },
  library: {
    type: String,
    required: true,
    unique: false
  },
  importPath: {
    type: String,
  },
  networkPath: {
    type: String,
  },
  fileTree: {
    type: Object
  },
  trackSources: {
    type: Object
  },
  albumSources: {
    type: Object
  },
  compilationSources: {
    type: Object
  },
})

exports.ImportSession = mongoose.model('ImportSession', schema)
