var fs = require('fs');
var mlt = require('./lib/moreLikeThis');

var content = fs.readFileSync('./example.txt').toString();

mlt.moreLikeThis(content, function(result) {
  result.forEach(function(item) {
    console.log('\n', 'score:', item.score, '\n', item.fields);
  });
});