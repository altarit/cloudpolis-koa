module.exports = {
  "secret": "replace_me",
  "accessToken": {
    "expiresInMinutes": 10,
    "secret": "access_replace"
  },
  "refreshToken": {
    "expiresInMinutes": 30,
    "secret": "refresh_replace"
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
};
