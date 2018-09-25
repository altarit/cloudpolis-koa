const Validator = require('jsonschema').Validator;
const validator = new Validator();

module.exports = (schema) => async function (ctx, next) {

  console.log(validator.validate(body, schema));
};
