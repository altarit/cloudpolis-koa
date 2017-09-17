const util = require('util');
const log = require('lib/log')(module);
const mongoose = require('lib/mongoose');

let schema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  song: {
    type: String
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
  referer: {
    type: String
  }
});

exports.MusicStat = mongoose.model('MusicStat', schema);




