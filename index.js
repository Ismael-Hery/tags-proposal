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
  indexName: 'sept',
  searchFields: ['item_titre_exact','texte_exact'],
  returnedFields: ['item_id', 'item_titre','texte'],
  from: moment().subtract('days', 30),
  dateFieldName: 'date_creation',
  typeItem: 4
};

mlt.moreLikeThis(content, options, function(result) {
  //console.log(result);
  result.forEach(function(item) {
    console.log('\n', 'score:', item.score, '\n', item.fields);
  });
});