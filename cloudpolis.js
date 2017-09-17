const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const session = require('koa-generic-session');
const sessionStore = require('lib/sessionStore');

const config = require('./config');
const routes = require('./routes');

app.use(bodyParser({formLimit: 1024 * 1024 * 2}));

app.keys = [config.session.secret];
app.use(session({store: sessionStore}));

app.use(require('./middlewares/initSession'));
app.use(require('./middlewares/loadUser'));
app.use(require('./middlewares/logRequest'));
app.use(require('./middlewares/sendHttpError'));
app.use(require('./middlewares/setParams'));

router.use('/api/', routes.routes());
app.use(router.routes());

app.listen(config.port);
