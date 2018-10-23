const Router = require('koa-router')
const { HttpError, AuthError } = require('src/lib/error/index')
const checkRoles = require('../middlewares/checkRoles')
const validateRequest = require('../middlewares/validateRequest')

const log = require('src/lib/log')(module)

const controllers = [
  require('../controllers/authCtrl'),
  require('../controllers/musicCtrl'),
  require('../controllers/playlistsCtrl'),
  require('../controllers/usersCtrl'),
  require('../controllers/homeCtrl'),
  require('../controllers/pathCtrl'),
  require('../controllers/importCtrl'),
]

const SYSTEM_METHODS = ['params']
const ALLOWED_HTTP_METHODS = ['get', 'post', 'put', 'delete']

function findRoutes () {
  const router = Router()

  controllers.forEach(ctrl => {
    const ctrlPatams = ctrl.params
    const handlers = Object.keys(ctrl).filter(el => !SYSTEM_METHODS.includes(el))

    if (ctrlPatams === undefined) {
      log.warn(`Found a controller without params object. Skip handlers: %s.`, handlers)
      return
    }

    const { base, name } = ctrlPatams

    if (base === undefined) {
      log.warn(`Found a controller without base path. Skip handlers: %s.`, handlers)
      return
    }

    handlers.forEach(handlerName => {
      const handlerParams = ctrl[handlerName]
      const { path, method, handler, roles, schema, required } = handlerParams

      if (!ALLOWED_HTTP_METHODS.includes(method)) {
        log.warn(`Handler %s in %s controller has incorrect method field: %s. Expected %s. Skip.`,
          handlerName, base, method, ALLOWED_HTTP_METHODS)
        return
      }
      if (typeof handler !== 'function') {
        log.warn(`Handler %s in %s controller has incorrect handler field: %s. Skip.`, handlerName, base, handler)
        return
      }
      if (typeof path !== 'string') {
        log.warn(`Handler %s in %s controller has incorrect path field: %s. Skip.`, handlerName, base, path)
        return
      }
      // if (!Array.isArray(middlewares)) {
      //   log.warn(`%s in %s controller has incorrect middlewares field: %s. Skip.`, handlerName, base, middlewares)
      //   return
      // }

      const url = base + path
      const handlerId = '/' + base + handlerName
      const middlewares = []

      if (roles) {
        middlewares.push(checkRoles(roles))
      }
      if (schema) {
        middlewares.push(validateRequest(handlerId, schema, required))
      }

      log.debug(`Register path %s`, url)
      router[method](url, ...middlewares, handler)
    })


  })

  return router
}

module.exports = findRoutes
