class UserDto {
  constructor (user) {
    this.username = user.username
    this.created = user.created
    this.additional = user.additional
  }
}

module.exports = UserDto
