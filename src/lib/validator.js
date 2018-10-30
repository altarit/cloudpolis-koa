const Validator = require('jsonschema').Validator

const log = require('src/lib/log')(module)

const validator = new Validator()

exports.validator = validator
exports.addSchema = addSchema
exports.addRequestValidator = addRequestValidator


function addSchema (id, schema) {
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

function addRequestValidator (id, requestSchemaId, responseSchemaId) {
  if (requestSchemaId && typeof requestSchemaId !== 'string') {
    throw new Error(`Expected requestSchemaId is a string.`)
  }
  if (responseSchemaId && typeof responseSchemaId !== 'string') {
    throw new Error(`Expected responseSchemaId is a string.`)
  }

  return async function (ctx, next) {
    if (requestSchemaId) {
      const body = ctx.request.body
      const result = validator.validate(body, requestSchemaId)

      if (result.errors.length) {
        //log.warn(`Validation error: ` + result)
        //console.log(result)
        //throw result.errors[0]
        const { property, message, schema, name, argument, stack } = result.errors[0]
        throw new BadRequestError(message, property, schema)
      }
    }

    await next()

    if (responseSchemaId) {
      const payload = ctx.response.body || {}
      // TODO: Seems like a bug. Property name of payload.data is erased for some reason during validation.
      const data = JSON.parse(JSON.stringify(payload.data))
      const result = validator.validate(data, responseSchemaId)

      if (result.errors.length) {
        console.error(`Response doesn't match to it's schema: %s`, result.errors[0])
        // const { property, message, schema: schemaName, name, argument, stack } = result.errors[0]
      }
    }
  }
}
