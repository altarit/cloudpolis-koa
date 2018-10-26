const Validator = require('jsonschema').Validator

const { HttpError, AuthError } = require('src/lib/error/index')

const log = require('src/lib/log')(module)
const validator = new Validator()

module.exports = addRequestValidator

function addRequestValidator(id, requestSchema, responseSchema) {
  let requestSchemaId
  let responseSchemaId

  if (requestSchema) {
    requestSchemaId = id + '/req'
    addSchema(requestSchemaId, requestSchema)
  }
  if (responseSchema) {
    responseSchemaId = id + '/res'
    addSchema(responseSchemaId, responseSchema)
  }

  return async function (ctx, next) {
    if (requestSchemaId) {
      const body = ctx.request.body
      const result = validator.validate(body, requestSchemaId)

      if (result.errors.length) {
        //log.warn(`Validation error: ` + result)
        //console.log(result)
        //throw result.errors[0]
        const { property, message, schema: schemaName, name, argument, stack } = result.errors[0]
        throw new HttpError(400, result.errors[0])
      }
    }

    await next()

    if (responseSchemaId) {
      const payload = ctx.response.body || {}
      const result = validator.validate(payload.data, responseSchemaId)

      if (result.errors.length) {
        //log.warn(`Validation error: ` + result)
        console.log(result)
        //throw result.errors[0]
        const { property, message, schema: schemaName, name, argument, stack } = result.errors[0]
        //throw new HttpError(400, result.errors[0])
      }
    }
  }
}

function addSchema(id, schema) {
  schema.id = id
  schema.type = 'object'

  if (schema.properties !== undefined && typeof schema.properties !== 'object') {
    throw new Error(`Schema ${id} has wrong 'properties' object.`)
  }
  if (schema.required !== undefined && !Array.isArray(schema.required)) {
    throw new Error(`Schema ${id} has wrong 'required' object.`)
  }

  validator.addSchema(schema, id)

  return schema
}
