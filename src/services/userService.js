const User = require('src/models/user').User
const AuthError = require('src/lib/error/AuthError').AuthError

exports._findOneByName = async function (username) {
  return await User.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })
}

exports.cutExtraFields = function (user) {
  return {
    username: user.username,
    created: user.created,
    additional: user.additional
  }
}

exports.authorize = async function (username, password) {
  let user = await this._findOneByName(username)
  if (user) {
    if (user.checkPassword(password))
      return user
    else
      throw new AuthError('Wrong password')
  } else {
    throw new AuthError('There is not this username')
  }
}

function validateUserInfo(username, password, email, additional) {
  if (username !== null && !/^.{1,20}$/.test(username))
    throw new AuthError('Username should be shorter than 20 characters and consist of latin symbols and digits. You know it, right?')
  if (password !== null && !/^.{0,40}$/.test(password))
    throw new AuthError('Password: 6-40 characters')
  if (additional != null && additional.length > 1000)
    throw new AuthError('Additional should be shorter than 1000 characters.')
  if (email != null && email.length > 60)
    throw new AuthError('Email should be shorter than 60 characters.')
}

exports.register = async function (username, password, email, additional) {
  validateUserInfo(username, password, email, additional)

  let user = await this._findOneByName(username)
  if (user) {
    throw new AuthError('Username is already used')
  } else {
    let user = new User({ username: username, password: password, email: email, additional: additional })
    await user.save()
    return this.cutExtraFields(user)
  }
}

exports.edit = async function (username, oldpassword, newpassword, email, additional) {
  let user = await User._findOneByName(username)
  if (!user) {
    throw new AuthError('User doesn\' exist')
  }
  if (newpassword) {
    if (!user.checkPassword(oldpassword))
      throw new AuthError('Wrong password')
    validateUserInfo(null, newpassword, null, null)
    user.password = newpassword
  }
  validateUserInfo(null, null, email, additional)
  user.additional = additional
  await user.save()
  return User.cutExtraFields(user)
}

exports.addRole = function (username, role) {
  return User.update({ username: username }, { $addToSet: { roles: role } })
}

exports.getList = async function () {
  return await User.find({}, {
    _id: false,
    username: true,
    created: true,
    additional: true
  })
}

exports.getDetails = async function (name) {
  let user = await this._findOneByName(name)
  return this.cutExtraFields(user)
}
