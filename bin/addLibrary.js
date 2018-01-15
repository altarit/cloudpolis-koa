const fs = require('fs');
const path = require('path');
const mongoose = require('lib/mongoose');
const id3 = require('node-id3');

//mongoose.disconnect();
const options = {
  regexp: /^/i,
  insert: true,
  logMusic: true,
  libraries: {
    "Artists": "D:\\Documents\\Music\\MAv16\\Artists"
  },
  remove: false
};

const errors = {
  errorIDv2: [],
  notMp3: [],
  id3Errors: [],
  emptyArtist: [],
  emptyTitle: []
};


(async function () {
  console.log('Open connection');
  await new Promise((resolve) => {
    mongoose.connection.on('open', resolve);
  });

  console.log('Drop Compilations');
  let compilations = mongoose.connection.collections['compilations'];
  if (compilations) {
    await compilations.drop();
  }

  console.log('Create models:');
  require('models/library');
  require('models/compilation');
  require('models/song');
  await Promise.all(Object.keys(mongoose.models).map((modelName) => {
    console.log(' ' + modelName);
    return mongoose.models[modelName].ensureIndexes();
  }));

  console.log('Build FileSystem');
  for (let libraryName of Object.keys(options.libraries)) {
    await createCompilations(options.libraries[libraryName], options.regexp, libraryName);
  }
  console.log('\nDone. Press Ctrl+C for exit...');
})();

async function createCompilations(root, reg, library) {
  let objects = fs.readdirSync(root);
  for (let el of objects) {
    let fullpath = path.resolve(root, el);
    if (!fs.lstatSync(fullpath).isDirectory() || (reg && !reg.test(el))) {
      console.log('! - ' + el);
      continue;
    }
    printSeparator();
    printLine(el);

    let content = await lookInside(root, el, '/', 1, library);
    if (content.length) {
      if (options.insert) {
        let compilation = new mongoose.models.Compilation({
          name: el,
          songs: content,
          count: content.length,
          library: library
        });
        await compilation.save();
      }
    } else {
      console.log("empty folder ");
    }
  }

  console.log('--emptyTitle : ' + errors.emptyTitle.length + '--');
  console.log(errors.emptyTitle);
  console.log('--emptyArtist : ' + errors.emptyArtist.length + '--');
  console.log(errors.emptyArtist);
  console.log('--id3Errors : ' + errors.id3Errors.length + '--');
  console.log(errors.id3Errors);
  console.log('--errorIDv2 : ' + errors.errorIDv2.length + '--');
  console.log(errors.errorIDv2);
  console.log('--notMp3 : ' + errors.notMp3.length + '--');
  console.log(errors.notMp3);
}

async function lookInside(root, dir, fromroot, depth, library) {
  fromroot = fromroot + dir + '/';
  let newroot = path.resolve(root, dir);
  let objects = fs.readdirSync(newroot);
  let content = [];

  for (let el of objects) {
    let fullpath = path.resolve(newroot, el);

    if (fs.lstatSync(fullpath).isDirectory()) {
      let insideData = await lookInside(newroot, el, fromroot, depth + 1, library);
      if (insideData.length) {
        content = content.concat(insideData);
      } else {
        console.log("empty folder");
      }
    } else {
      if (/^.*\.(mp3|ogg|m4a|aac)$/i.test(el)) {
        if (options.logMusic) {
          printLine(el, depth);
        }

        let metadata = await getTags(fullpath);
        metadata.href = '/' + library + (fromroot + el).replace(/%/g, '%25').replace(/ /g, '%20');
        if (!metadata.artist) {
          errors.emptyArtist.push(fromroot + el);
          metadata.artist = fromroot.substring(1, fromroot.indexOf('/', 2));
        }
        if (!metadata.title) {
          errors.emptyTitle.push(fromroot + el);
          metadata.title = el.slice(0, -4);
        }
        if (!metadata.album) {
          metadata.album = dir;
        }
        metadata.library = library;

        console.log(metadata);

        content.push(metadata);
      }

    }
  }

  return content;
}

function printLine(str, depth) {
  console.log(new Array((depth | 0) * 4 + 1).join(' ') + str);
}
function printSeparator() {
  console.log('\n' + new Array(60).join('-') + '\n');
}

async function getTags(path) {

  let tags = id3.read(path)

  //
  // let metadata = {
  //   compilation: "AcousticBrony",
  //   library: "Artists",
  //   search: "it's ok",
  //   mark: 3,
  //   size: "11,86 MB",
  //   duration: "5:06",
  //   artist: "Acoustic Brony & Mysteriousbronie",
  //   title: "It's ok",
  //   href: "/Artists/AcousticBrony/Acoustic%20Brony%20&%20Mysteriousbronie%20-%20It's%20ok.mp3"
  // };

  //return metadata

  return {
    title: tags.title,
    artist: tags.artist,
    album: tags.album,
    year: tags.year
  };
}
