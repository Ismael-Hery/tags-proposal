var fs = require('fs');
var mlt = require('./lib/moreLikeThis');

var content = fs.readFileSync('./example.txt').toString();

console.log(content);