module.exports = {
  "secret": "secret_replace_me",
  "users": [{
    "username": "admin",
    "password": "1",
    "roles": ["admin"]
  }],
  "accessToken": {
    "expiresInMinutes": 60,
    "secret": "access_replace_me"
  },
  "refreshToken": {
    "expiresInMinutes": 300,
    "secret": "refresh_replace_me"
  },
  "http": {
    "bodyLimitInKb": 2048,
    "port": 3002,
    "disableCache": true,
    "cors": {
      "enabled": true,
      "origin": "http://localhost:3000"
    }
  },
  "logs": {
    "dirPath": "./logs/"
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
}
