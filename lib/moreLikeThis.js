var request = require('superagent');
var moment = require('moment');
var _ = require('lodash');

exports.moreLikeThis = moreLikeThis;


/**
 * [moreLikeThis description]
 * @param  {String}   content to find related content
 * @param  {Function} cb
 * @return {[type]} does not return
 */
function moreLikeThis(content, indexName, from, cb) {

  var baseUrl = 'http://ci-cms:9090/services/rest/index/' + indexName + '/morelikethis';

  var fromDate = from.format('YYYY-MM-DD');

  var mltParams = {
    "likeText": content,
    "analyzerName": "StandardAnalyzer",
    "fields": [
      "content_standard",
      "title_standard"
    ],
    "minWordLen": 4,
    "maxWordLen": 100,
    "minDocFreq": 1,
    "minTermFreq": 1,
    "maxNumTokensParsed": 5000,
    "maxQueryTerms": 25,
    "stopWords": "French stop words",
    "returnedFields": [
      "id",
      "date",
      "title",
      "content"
    ],
    "filters": [{
      "type": "QueryFilter",
      "negative": false,
      "query": "date:[" + fromDate + " TO NOW]"
    }],
    "start": 0,
    "rows": 20
  };

  request.post(baseUrl).send(mltParams).accept('json').type('json').end(function(err, res) {
    if (err) {
      console.log("Problem while connecting to OSS", err);
      return;
    }

    if (res.ok) {
      cb(res.body.documents);

    } else {
      console.log(res)
    }
  });

}