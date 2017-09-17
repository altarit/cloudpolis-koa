module.exports = {
  "port": 3002,
  "session": {
    "secret": 'PinkieSwear'
  },
  "mongoose": {
    "uri": "mongodb://localhost/Equestria",
    "options": {
      "server": {
        "socketOptions": {
          "keepAlive": 1
        }
      }
    }
  },
};
