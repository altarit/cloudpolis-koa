var fs = require('fs');
var path = require('path');
var mongoose = require('src/lib/mongoose');
var id3 = require('id3js');
var deasync = require('deasync');
var ffprobe = require('ffprobe');
var co = require('co');

//mongoose.disconnect();
var options = {
  //regexp: /^/i,
  regexp: /^/i,
  removeEmptyFolders: false,
  insertIntoDB: false,
  logMusic: true
};

var root = 'D:/Documents/Music/MAv16/Artists';
//var root = '/media/twilight/Data/Documents/Music/MAv16/Artists';
var rootlength = root.length;

var errorIDv2 = [];
var notMp3 = [];
var id3Errors = [];
var emptyArtist = [];
var emptyTitle = [];
function createCompilations(root, reg) {
  var objects = fs.readdirSync(root);
  objects.forEach(function (el, i) {
    var fullpath = path.resolve(root, el);
    if (!fs.lstatSync(fullpath).isDirectory() || (reg && !reg.test(el))) {
      //console.log('! - ' + el);
      return;
    }
    printSeparator();
    printLine(el);
    var content = lookInside(root, el, '/', 1);

    if (!content.length) {
      console.log("!-- " + content.length);
      if (options.removeEmptyFolders)
        deleteFolderRecursive(path.resolve(root, el));
    } else if (options.insertIntoDB) {
      var compilation = new mongoose.models.Compilation({
        name: el,
        songs: content,
        count: content.length
      });
      compilation.save();
      //console.log(compilation);
    }
  });
  console.log('--emptyTitle : ' + emptyTitle.length + '--');
  console.log(emptyTitle);
  console.log('--emptyArtist : ' + emptyArtist.length + '--');
  console.log(emptyArtist);
  console.log('--id3Errors : ' + id3Errors.length + '--');
  console.log(id3Errors);
  console.log('--errorIDv2 : ' + errorIDv2.length + '--');
  console.log(errorIDv2);
  console.log('--notMp3 : ' + notMp3.length + '--');
  console.log(notMp3);
}

function lookInside(root, dir, fromroot, depth) {
  var fromroot = fromroot + dir + '/';
  var newroot = path.resolve(root, dir);
  var objects = fs.readdirSync(newroot);
  var content = [];

  objects.forEach(function (el, i) {
    var fullpath = path.resolve(newroot, el);

    if (fs.lstatSync(fullpath).isDirectory()) {
      var insideData = lookInside(newroot, el, fromroot, depth + 1);
      if (!insideData.length) {
        console.log("!-- " + insideData.length);
        if (options.removeEmptyFolders)
          deleteFolderRecursive(fullpath);
      }
      else {
        content = content.concat(insideData);
      }
    } else {
      if (/^.*\.(mp3|ogg|m4a|aac)$/i.test(el)) {
        if (options.logMusic)
          printLine(el, depth);

        var metadata = getTags(fullpath);
        metadata.src = (fromroot + el).replace(/%/g, '%25').replace(/ /g, '%20');
        if (!metadata.artist) {
          emptyArtist.push(fromroot + el);
          metadata.artist = fromroot.substring(1, fromroot.indexOf('/', 2));
        }
        if (!metadata.title) {
          emptyTitle.push(fromroot + el);
          metadata.title = el.slice(0, -4);
        }
        if (!metadata.album) {
          metadata.album = dir;
        }

        content.push(metadata);
      } else {
        //console.log('! '+el)
      }
    }
  });
  return content;
}

function getTags(path) {
  var ret;
  try {
    //var ret = yield new Promise((resolve) => {
    id3({file: path, type: id3.OPEN_LOCAL}, function (err, tags) {
      //console.log(err);
      if (err)
        id3Errors.push(err);
      //console.log(tags);
      ret = tags.v2;
      //resolve(tags.v2);
    });
    //});
    while (ret === undefined) {
      deasync.runLoopOnce();
    }
  } catch (e) {
    if (e)
      id3Errors.push(e);
  }

  var probe;
  /*console.log(path);
  ffprobe(path, function(err, probeData) {
    console.log('Probe: ' + err);
    probe = probeData.format;
  });
  while (probe === undefined) {
    deasync.runLoopOnce();
  }*/

  probe = {
    duration: 180,
    size: 1024 * 1024 * 2
  };

  return {
    title: ret.title,
    artist: ret.artist,
    album: ret.album,
    //duration: toMMSS(probe.duration),
    size: probe.size
  };
}

function encode(ba) {
  if (ba)
    return (ba + "").substring(2).toString('utf-8');
  return null;
}

function printLine(str, depth) {
  console.log(new Array((depth | 0) * 4 + 1).join(' ') + str);
}
function printSeparator() {
  console.log('\n' + new Array(60).join('-') + '\n');
}

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function toMMSS(sec_num) {
  var minutes = Math.floor(sec_num / 60);
  var seconds = Math.floor(sec_num - minutes * 60);
  //if (minutes < 10) minutes = minutes; //2x alt255 (it's bad, I know)
  if (seconds < 10) seconds = '0' + seconds;
  return minutes + ':' + seconds;
}

co(function* () {
  console.log('Open connection');
  yield new Promise((resolve) => {
    mongoose.connection.on('open', resolve);
  });

  console.log('Drop Compilations');
  var compilations = mongoose.connection.collections['compilations'];
  if (compilations)
    yield compilations.drop();

  console.log('Create models:');
  require('src/models/compilation');
  yield Promise.all(Object.keys(mongoose.models).map((modelName) => {
    console.log(' ' + modelName);
    return mongoose.models[modelName].ensureIndexes();
  }));

  console.log('Build FileSystem');
  createCompilations(root, options.regexp);
  //createCompilations(root, /^[r]/i);
  //createCompilations(root, /^[n-p]/i);

  console.log('\nDone. Press Ctrl+C for exit...');
})
  .catch((err) => {
    console.log('Error: ' + err);
    console.log('\nPress Ctrl+C for exit...');
  });
