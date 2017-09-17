exports.index = async function (ctx, next) {
  let result = {text: 'Hello Everypony!!!'};
  ctx.body = result;
};

exports.inProgress = async function (ctx, next) {
  ctx.body = {text: 'Not implemented yet.'};
};
