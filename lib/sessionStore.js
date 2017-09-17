const mongooseStore = require('koa-session-mongoose');
const mongoose = require('lib/mongoose');

module.exports = mongooseStore.create({
  collection: 'sessions',
  connection: mongoose.connection,
  expires: 60 * 60 * 24 * 14 //two weeks
});
