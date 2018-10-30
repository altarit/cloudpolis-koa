const Router = require('koa-router')

const { HttpError, AuthError } = require('src/lib/error')
const checkRoles = require('../middlewares/checkRoles')
const { addRequestValidator, addSchema} = require('./validator')
const log = require('src/lib/log')(module)

const controllers = [
  require('../controllers/authCtrl'),
  require('../controllers/musicCtrl'),
  require('../controllers/playlistsCtrl'),
  require('../controllers/librariesCtrl'),
  require('../controllers/compilationsCtrl'),
  require('../controllers/importSessionsCtrl'),
  require('../controllers/usersCtrl'),
  require('../controllers/homeCtrl'),
  require('../controllers/pathCtrl'),
  require('../controllers/importCtrl'),
]

const schemas = [
  require('./schemas/compilationsSchemas'),
  require('./schemas/librariesSchemas'),
  require('./schemas/importSchemas'),
  require('./schemas/importSessionsSchema'),
  require('./schemas/authSchemas'),
  require('./schemas/musicSchemas'),
]

const SYSTEM_METHODS = ['params']
const ALLOWED_HTTP_METHODS = ['get', 'post', 'put', 'delete']

function findRoutes () {
  const router = Router()

  schemas.forEach(mdl => {
    const schemaDecls = Object.keys(mdl).filter(el => !SYSTEM_METHODS.includes(el)).map(name => mdl[name])

    schemaDecls.forEach(({id, schema}) => {
      addSchema(id, schema)
    })
  })

  controllers.forEach(ctrl => {
    const ctrlPatams = ctrl.params
    const handlers = Object.keys(ctrl).filter(el => !SYSTEM_METHODS.includes(el))

    if (ctrlPatams === undefined) {
      log.warn(`Found a controller without params object. Skip handlers: %s.`, handlers)
      return
    }

    const { base, name, roles: controllerRoles } = ctrlPatams

    if (base === undefined) {
      log.warn(`Found a controller without base path. Skip handlers: %s.`, handlers)
      return
    }

    handlers.forEach(handlerName => {
      const handlerParams = ctrl[handlerName]
      const { path, method, handler, roles = controllerRoles, requestSchema, responseSchema, name } = handlerParams

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
      const middlewares = []

      if (roles) {
        middlewares.push(checkRoles(roles))
      }
      if (requestSchema || responseSchema) {
        const handlerId = '/' + (name || base) + handlerName

        middlewares.push(addRequestValidator(handlerId, requestSchema, responseSchema))
      }

      // log.debug(`Register path %s`, url)
      router[method](url, ...middlewares, handler)
    })


  })

  return router
}

module.exports = findRoutes
