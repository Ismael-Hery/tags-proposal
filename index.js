var fs = require('fs');
var moment = require('moment');
var mlt = require('./lib/moreLikeThis');

var content = fs.readFileSync('./example.txt').toString();

mlt.moreLikeThis(content, 'depeches', moment().subtract('days', 1), function(result) {
  result.forEach(function(item) {
    console.log('\n', 'score:', item.score, '\n', item.fields);
  });
});