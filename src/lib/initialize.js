const { User } = require('src/models')
const log = require('src/lib/log')(module)

module.exports = initialize

async function initialize () {
  const foundUser = await User.findOne({ username: 'admin' })
  if (!foundUser) {
    const newUser = new User({
      username: 'admin',
      password: '1',
      email: 'admin@cloudpolis.net'
    })
    await newUser.save()
    log.debug(`Created user '%s'.`, newUser.username)
  }
}
