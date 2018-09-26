const { User } = require('src/models/user')
const { AuthError } = require('src/lib/error')

exports.authorize = authorize
exports.register = register
exports.edit = edit
exports.getList = getList
exports.getDetails = getDetails

/* public methods */

async function authorize (username, password) {
  log.debug(`authorize user '%s'`, username)
  const user = await findOneByName(username)
  if (user) {
    if (user.checkPassword(password))
      return user
    else
      throw new AuthError('Wrong password')
  } else {
    throw new AuthError('There is not this username')
  }
}

async function register (username, password, email, additional) {
  log.debug(`authService.register() with username %s`, username)
  validateUserInfo(username, password, email, additional)

  const user = await findOneByName(username)
  if (user) {
    throw new AuthError('Username has already taken.')
  } else {
    let user = new User({
      username: username,
      password: password,
      email: email,
      additional: additional
    })
    await user.save()
    return this.cutExtraFields(user)
  }
}

async function edit (username, oldPassword, newPassword, email, additional) {
  let user = await User._findOneByName(username)
  if (!user) {
    throw new AuthError('User doesn\'t exist')
  }
  if (newPassword) {
    if (!user.checkPassword(oldPassword))
      throw new AuthError('Wrong password')
    validateUserInfo(null, newPassword, null, null)
    user.password = newpassword
  }
  validateUserInfo(null, null, email, additional)
  user.additional = additional
  await user.save()
  return User.cutExtraFields(user)
}

async function getList () {
  return await User.find({}, {
    _id: false,
    username: true,
    created: true,
    additional: true
  })
}

async function getDetails (name) {
  const user = await findOneByName(name)
  return this.cutExtraFields(user)
}

/* private methods */

function validateUserInfo (username, password, email, additional) {
  if (!username && !/^.{1,20}$/.test(username)) {
    throw new AuthError('Username should be shorter than 20 characters and consist of latin symbols and digits.' +
      ' You know it, right?')
  }
  if (!password && !/^.{0,40}$/.test(password)) {
    throw new AuthError('Password: 6-40 characters')
  }
  if (email && email.length > 60) {
    throw new AuthError('Email should be shorter than 60 characters.')
  }
  if (additional && additional.length > 1000) {
    throw new AuthError('Additional should be shorter than 1000 characters.')
  }
}

async function findOneByName (username) {
  return await User.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })
}

async function addRole (username, role) {
  return await User.update({
    username: username
  }, {
    $addToSet: { roles: role }
  })
}

function cutExtraFields (user) {
  return {
    username: user.username,
    created: user.created,
    additional: user.additional
  }
}
