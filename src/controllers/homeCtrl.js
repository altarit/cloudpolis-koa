exports.index = async function (ctx) {
  ctx.body = {
    status: 200,
    data: {
      message: 'Hello Everypony!!!'
    }
  }
}

exports.inProgress = async function (ctx) {
  ctx.body = {
    status: 500,
    error: {
      message: 'Not implemented yet.'
    }
  }
}
