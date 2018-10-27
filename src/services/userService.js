const { User } = require('src/models/user')
const UserDto = require('src/dto/UserDto')
const { AuthError, BadRequestError } = require('src/lib/error')
const log = require('src/lib/log')(module)

exports.authorize = authorize
exports.register = register
exports.edit = edit
exports.getList = getList
exports.getDetails = getDetails

/* public methods */

async function authorize (username, password) {
  log.debug(`Login user '%s'`, username)
  const user = await findOneByName(username)

  if (user) {
    if (user.checkPassword(password))
      return user
    else
      throw new AuthError(`Wrong password.`)
  } else {
    throw new AuthError(`Not found user ${username}.`)
  }
}

async function register (username, password, email, additional) {
  log.debug(`authService.register() with username %s`, username)
  validateUserInfo(username, password, email, additional)

  try {
    const user = new User({ username, password, email, additional })
    await user.save()

    return new UserDto(user)
  } catch (e) {
    if (e.name === 'MongoError' && e.code === 11000) {
      throw new BadRequestError(`Username has already taken.`)
    }
    throw e
  }
}

async function edit (username, oldPassword, newPassword, email, additional) {
  const user = await User._findOneByName(username)

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
  return new UserDto(user)
}

async function getList () {
  return await User.find({}, {
    _id: false,
    username: true,
    created: true
  })
}

async function getDetails (name) {
  const user = await findOneByName(name)
  return new UserDto(user)
}

/* private methods */

function validateUserInfo (username, password, email, additional) {
  if (!username && !/^.{1,20}$/.test(username)) {
    throw new BadRequestError('Username should be shorter than 20 characters and consist of latin symbols and digits.' +
      ' You know it, right?')
  }
  if (!password && !/^.{0,40}$/.test(password)) {
    throw new BadRequestError('Password: 6-40 characters')
  }
  if (email && email.length > 60) {
    throw new BadRequestError('Email should be shorter than 60 characters.')
  }
  if (additional && additional.length > 1000) {
    throw new BadRequestError('Additional should be shorter than 1000 characters.')
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
