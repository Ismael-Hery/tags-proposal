var env = require('../config/conf.json');

var node_env = process.env.NODE_ENV || 'development';

module.exports = env[node_env]