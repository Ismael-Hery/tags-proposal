var request = require('superagent');
var _ = require('lodash');

exports.moreLikeThis = moreLikeThis;


/**
 * [moreLikeThis description]
 * @param  {String}   content to find related content
 * @param  {Function} cb
 * @return {[type]} does not return
 */
function moreLikeThis(content, cb) {

  console.log(content);

  var baseUrl = 'http://ci-cms:9090/services/rest/index/sept_ihe/morelikethis';

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
    "boost": true,
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
      "query": "date:[2014-02-17 TO NOW]"
    }],
    "start": 0,
    "rows": 30
  }

  request.post(baseUrl).query(mltParams).end(function(err, res) {
    if (err) {
      console.log("Problem while connecting to OSS", err);
      return;
    }

    if (res.ok) {
      cb(res.body);

    } else {
      console.log(res)
    }
  });

  return;
}

