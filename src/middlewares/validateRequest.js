const Validator = require('jsonschema').Validator

const { HttpError, AuthError } = require('src/lib/error/index')

const log = require('src/lib/log')(module)
const validator = new Validator()

module.exports = (id, properties = {}, required = []) => {
  const schema = {
    id,
    type: 'object',
    properties,
    required
  }

  validator.addSchema(schema, id)

  return async function (ctx, next) {
    const body = ctx.request.body
    const result = validator.validate(body, id)

    if (result.errors.length) {
      //log.warn(`Validation error: ` + result)
      //console.log(result)
      //throw result.errors[0]
      const { property, message, schema: schemaName, name, argument, stack } = result.errors[0]
      throw new HttpError(400, result.errors[0])
    }

    await next()
  }
}
