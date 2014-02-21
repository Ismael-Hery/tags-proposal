var tagProposer = require('./lib/tagsProposer');
var async = require('async');
var lmApi = require('./lib/lmApi');


var articlesWithRubs = [];

function getRubriques(article, cb){

   lmApi.getArticle(article.id, function(apiItem){

      var rubriquesIds = apiItem.rubriques.map(function(rub){
         return rub.id;
      })

      articlesWithRubs.push({id: article.id, score:article.score, rubIds: rubriquesIds})

      cb(null);
   });
};

var articles = tagProposer.moreLikeThis('', function (articles) {
   console.log(articles);

   async.each(articles,  getRubriques, function(){
      console.log(articlesWithRubs)
   });

});

