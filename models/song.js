const util = require('util');
const log = require('lib/log')(module);
const mongoose = require('lib/mongoose');

var schema = new mongoose.Schema({
  title: {
    type: String,
    requred: true
  },
  artist: {
    type: String,
    required: true
  },
  compilation: {
    type: String,
    required: true,
    unique: false
  },
  album: {
    type: String
  },
  src: {
    type: String,
    requred: true,
    unique: true
  },
  duration: {
    type: String
  },
  size: {
    type: String
  },
  search: {
    type: String
  },
  mark: {
    type: Number
  },
  rand: {
    type: Number
  },
  // dir: {
  //   type: String,
  //   required: true
  // },
  library: {
    type: String
  }
});

exports.Song = mongoose.model('Song', schema);




