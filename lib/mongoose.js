const mongoose = require('mongoose');
const config = require('config');

const props = config.mongoose
const auth = props.username ? `${props.username}:${props.password}@` : ''
const uri = `mongodb://${auth}${props.host}:${props.port}/${props.database}`
mongoose.connect(uri);

module.exports = mongoose;
