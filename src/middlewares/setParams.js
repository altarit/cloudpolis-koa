module.exports = async function (ctx, next) {
  ctx.set("Access-Control-Allow-Origin", "http://localhost:3000")
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
  ctx.set("Access-Control-Allow-Credentials", true)
  ctx.set("Access-Control-Max-Age", '86400') // 24 hours
  ctx.set("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Auth")
  if (ctx.method === 'OPTIONS') {
    // IE8 does not allow domains to be specified, just the *
    // headers["Access-Control-Allow-Origin"] = req.headers.origin;
    ctx.status = 200
    ctx.body = 'hi'
  }
  ctx.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  ctx.set('Expires', '-1')
  ctx.set('Pragma', 'no-cache')

  console.log('origin: ' + ctx.get('Origin'))
  //this.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  await next()
}
