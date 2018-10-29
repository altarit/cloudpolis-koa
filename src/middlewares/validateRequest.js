const { BadRequestError } = require('src/lib/error/index')
const validator = require('src/lib/validator')
const log = require('src/lib/log')(module)

exports.addRequestValidator = addRequestValidator
exports.addSchema = addSchema

function addRequestValidator(id, requestSchema, responseSchema) {
  let requestSchemaId
  let responseSchemaId

  if (requestSchema) {
    if (typeof requestSchema === 'string') {
      requestSchemaId = requestSchema
    } else if (typeof requestSchema === 'object') {
      requestSchemaId = id + '/req'
      addSchema(requestSchemaId, requestSchema)
    } else {
      throw new Error(`requestSchema neither is string  nor object`)
    }
  }
  if (responseSchema) {
    if (typeof responseSchema === 'string') {
      responseSchemaId = responseSchema
    } else if (typeof responseSchema === 'object') {
      responseSchemaId = id + '/res'
      addSchema(responseSchemaId, responseSchema)
    } else {
      throw new Error(`requestSchema neither is string  nor object`)
    }
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
