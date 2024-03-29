var request = require('superagent');
var moment = require('moment');
var _ = require('lodash');

exports.moreLikeThis = moreLikeThis;


/**
 * Give related content by using the More Like This feature of OSS/Lucene
 * @param  {Content}   content to find related content
 * @param  {Array}     options Array of options :
 * - indexName
   - searchFields
   - returnedFields
   - from (moment.js date to search from)
   - dateFieldName (name of the date field to use in the "from" filter )
   - typeItem (Id)
 * @param  {Function} cb
 * @return {[type]} does not return
 */
function moreLikeThis(content, options, cb) {

  var baseUrl = 'http://search1.lemonde.fr:8080/services/rest/index/' + options.indexName + '/morelikethis';

  var fromDate = options.from.format('YYYY-MM-DD');

  console.log(fromDate);

  var mltParams = {
    "likeText": content,
    "analyzerName": "StandardAnalyzer",
    "fields": options.searchFields,
    "minWordLen": 2,
    "maxWordLen": 100,
    "minDocFreq": 1,
    "minTermFreq": 1,
    "maxNumTokensParsed": 5000,
    "maxQueryTerms": 30,
    "stopWords": "French stop words",
    "returnedFields": options.returnedFields,
    "filters": [{
      "type": "QueryFilter",
      "negative": false,
      "query": options.dateFieldName + ":[" + fromDate + " TO NOW]"
    }],
    "start": 0,
    "rows": 25
  };

  if (options.typeItem !== undefined) {
    mltParams.filters.push({
      "type": "QueryFilter",
      "negative": false,
      "query": "type_item_id:" + options.typeItem
    });
  }

  console.log(baseUrl);

  request.post(baseUrl).send(mltParams).accept('json').type('json').end(function(err, res) {
    if (err) {
      console.log("Problem while connecting to OSS", err);
      return;
    }

    if (res.ok) {
      console.log(res.body);
      cb(res.body.documents);

    } else {
      console.log(res)
    }
  });

}
