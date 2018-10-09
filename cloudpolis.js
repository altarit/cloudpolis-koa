const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')
const router = require('koa-router')()

const config = require('./config/index')
const initialize = require('./src/lib/initialize')
const routes = require('./src/routes')

const log = require('src/lib/log').prepareLogger('cloudpolis.js')

const { http } = config
const { port, bodyLimitInKb } = http

app.use(bodyParser({ formLimit: 1024 * bodyLimitInKb }))

app.keys = [config.secret]

app.use(require('./src/middlewares/parseToken'))
app.use(require('./src/middlewares/logRequest'))
app.use(require('./src/middlewares/sendHttpError'))
app.use(require('./src/middlewares/setParams'))

router.use('/api/', routes.routes())
app.use(router.routes())

initialize()
  .then(res => {
    log.debug(`Starting the server...`)
    app.listen(port, (cb) => {
      log.debug(`Server is up & running on ${port} port.`)
    })
  })
  .catch(err => {
    log.stackTrace(`Error at initializing the app.`, err)
  })
