exports.index = async function (ctx, next) {
  console.log('2222222222')
  ctx.body = {
    status: 200,
    payload: {
      message: 'Hello Everypony!!!'
    }
  }
}

exports.inProgress = async function (ctx, next) {
  ctx.body = {
    status: 500,
    error: {
      message: 'Not implemented yet.'
    }
  }
}
