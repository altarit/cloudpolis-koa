exports.index = async function (ctx) {
  ctx.body = {
    status: 200,
    payload: {
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
