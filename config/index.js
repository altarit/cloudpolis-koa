module.exports = {
  "port": 3002,
  "secret": "replace_me",
  "accessToken": {
    "expiresInMinutes": 10,
    "secret": "access_replace"
  },
  "refreshToken": {
    "expiresInMinutes": 30,
    "secret": "refresh_replace"
  },
  "mongoose": {
    "host": "127.0.0.1",
    "port": 27017,
    "database": "cloudpolis",
    "username": "",
    "password": "password",
    "options": {
      "server": {
        "socketOptions": {
          "keepAlive": 1
        }
      }
    }
  },
};
