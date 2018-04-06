const util = require('util');
const log = require('lib/log')(module);
const mongoose = require('lib/mongoose');

let schema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

exports.LibrarySource = mongoose.model('LibrarySource', schema);
