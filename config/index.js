module.exports = {
  "port": 3002,
  "jwt": {
    "secret": "PinkieSwear"
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
