const crypto = require('crypto')
const mongoose = require('src/lib/mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  additional: {
    type: String
  },
  avatar: {
    type: Boolean
  },
  roles: {
    type: Object
  }
})

schema.methods.encryptPassword = function (password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
}

schema.virtual('password')
  .set(function (password) {
    this._plainPassword = password
    this.salt = Math.random() + ''
    this.hashedPassword = this.encryptPassword(password)
  })
  .get(function () {
    return this._plainPassword
  })

schema.methods.checkPassword = function (password) {
  return this.encryptPassword(password) == this.hashedPassword
}

exports.User = mongoose.model('User', schema)





