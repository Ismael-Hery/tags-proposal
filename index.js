var fs = require('fs');
var moment = require('moment');
var mlt = require('./lib/moreLikeThis');

var content = fs.readFileSync('./example.txt').toString();

/*
var options = {
  indexName: 'depeches',
  searchFields: ['content_standard', 'title_standard'],
  returnedFields: ['id', 'date', 'title', 'content'],
  dateFieldName:date,
  from: moment().subtract('days', 1)
};
*/

var options = {
  indexName: 'sept_ihe',
  searchFields: ['texte_exact'],
  returnedFields: ['item_id', 'item_titre'],
  from: moment().subtract('days', 365),
  dateFieldName: 'date_creation',
  options.typeItem: 4
};

mlt.moreLikeThis(content, options, function(result) {
  console.log(result);
  /*result.forEach(function(item) {
    console.log('\n', 'score:', item.score, '\n', item.fields);
  });*/
});