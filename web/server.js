var http = require('http');

var app = require('./app');

var server = http.createServer(app);

server.listen(3003);

server.on('listening', function () {
  console.log(server.address());
});
