const util = require('util');
const log = require('lib/log')(module);
const mongoose = require('lib/mongoose');

let schema = new mongoose.Schema({
  name: {
    type: String,
    unique: false,
    required: true
  }
});

exports.Library = mongoose.model('Library', schema);




