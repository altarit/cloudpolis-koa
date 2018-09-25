const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')
const router = require('koa-router')()

const config = require('./config/index')
const routes = require('./src/routes')

const log = require('src/lib/log')(module)

app.use(bodyParser({ formLimit: 1024 * 1024 * 2 }))

app.keys = [config.secret]

app.use(require('./src/middlewares/loadUser'))
app.use(require('./src/middlewares/logRequest'))
app.use(require('./src/middlewares/sendHttpError'))
app.use(require('./src/middlewares/setParams'))

router.use('/api/', routes.routes())
app.use(router.routes())

app.listen(config.port)

log.debug(`Server is up & running on ${config.port} port`)
