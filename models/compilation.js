const util = require('util');
const log = require('lib/log')(module);
const mongoose = require('lib/mongoose');

let schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  library: {
    type: String,
    required: true,
    unique: false
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
});

exports.Compilation = mongoose.model('Compilation', schema);




