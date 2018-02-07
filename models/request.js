const util = require('util');
const log = require('lib/log')(module);
const mongoose = require('lib/mongoose');

let schema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  path: {
    type: String
  },
  query: {
    type: String
  },
  body: {
    type: Object
  },
  user: {
    type: String
  },
  session: {
    type: String
  },
  ip: {
    type: String
  },
  agent: {
    type: String
  },
  referer: {
    type: String
  },
  time: {
    type: Number
  },
  status: {
    type: Number
  },
  response: {
    type: Object
  }
});

exports.Request = mongoose.model('Request', schema);




