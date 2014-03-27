var fs = require('fs');
var moment = require('moment');
var mlt = require('./lib/moreLikeThis');

var content = fs.readFileSync('./example.txt').toString();

var options = {
  indexName: 'depeches',
  searchFields: ['content_standard', 'title_standard'],
  returnedFields: ['id', 'date', 'title', 'content'],
  from: moment().subtract('days', 1)
};

mlt.moreLikeThis(content, options, function(result) {
  console.log(result);
  /*result.forEach(function(item) {
    console.log('\n', 'score:', item.score, '\n', item.fields);
  });*/
});