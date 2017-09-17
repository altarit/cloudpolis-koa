'use strinct';
var mongoose = require('lib/mongoose');
var co = require('co');
var Counter = require('models/counter').Counter;

var countersNames = ['post_id'];
//db.counters.update({_id: "post_id"}, {_id: "post_id", seq: 0}, {upsert: 1});
co(function* () {
  console.log('Open connection');
  yield openConnection();

  console.log('Init counters:');
  for (var i = 0, len = countersNames.length; i < len; i++) {
    var name = countersNames[i];
    var found = yield Counter.find({_id: name});
    console.log(name + '=' + found + ';');
    if (!found || !found.length) {
      console.log('added');
      var counter = new Counter({
        _id: name,
        seq: 0
      });
      yield counter.save();
    }
  }

  console.log('\nDone. Press Ctrl+C for exit...');
})
  .catch((err) => {
    console.log('Error: ' + err);
    console.log('\nPress Ctrl+C for exit...');
  });

function *openConnection() {
  yield new Promise((resolve) => {
    mongoose.connection.on('open', resolve);
  });

  yield Promise.all(Object.keys(mongoose.models).map((modelName) => {
    console.log(' ' + modelName);
    return mongoose.models[modelName].ensureIndexes();
  }));
}

