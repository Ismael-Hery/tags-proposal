var request = require('superagent');
var conf = require('./conf');

var default_page_size = 30;

var apiBaseUrl = 'http://prive.www.lemonde.fr/api/2/document/element/';

exports.getArticle = function(articleID, articleCB) {
   var apiURL = apiBaseUrl + articleID + '/';
   request.get(apiURL).end(function(res) {
      if (!res.ok)
         console.log('Problem while retrieving article with ID ', articleID, ' from LMAPI. Response: ', res.status);
      else
         articleCB(res.body);
   });
};

exports.lmApi = function(query, options, articleCB, endCB) {
   var baseUrl = apiBaseUrl + query;

   console.log('BASE URL', baseUrl);

   var i, count;

   request.get(baseUrl).query({
      count: true
   }).query(options).end(function(res) {
      if (res.ok) {

         count = res.body.count;

         console.log("total count=", count);

         var retrieve = function(startPage, endOffset, pageSize) {
            var offset = startPage * pageSize;

            request.get(baseUrl).query(options).query({
               complete: true,
               offset: offset,
               limit: pageSize
            }).end(function(err, res) {

               if (err)
                  console.log('error: in LM API Call', err.message);
               else {
                  if (res.ok) {
                     res.body.data.forEach(function(article) {

                        articleCB(article);

                     });

                     if (offset < endOffset) {
                        // On attend un peu avant l'appel suivant pour pas trop bourriner
                        setTimeout(function() {
                           retrieve(startPage + 1, count, default_page_size);
                        }, 5000);
                        console.log("count : " + offset + "/" + count);
                     } else {
                        endCB();
                     }
                  } else {
                     console.log('error: with LM API', res.error.path, ':', res.error.message);
                  }
               }
            });
         }

         retrieve(0, count, default_page_size);

      } else {
         console.log('error: with counting LM API on URL', baseUrl, res.error.path);
      }

   });

};