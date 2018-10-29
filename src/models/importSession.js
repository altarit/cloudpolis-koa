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
    required: true,
    unique: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
  },
  // hierarchy
  library: {
    type: String,
    required: true
  },
  // settings
  importPath: {
    type: String,
  },
  networkPath: {
    type: String,
  },
  // content
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
  // more content
  tracks: {
    type: Object
  },
  albums: {
    type: Object
  },
  compilations: {
    type: Object
  },
})

exports.ImportSession = mongoose.model('ImportSession', schema)
