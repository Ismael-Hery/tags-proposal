var tagProposer = require('./lib/tagsProposer');
var async = require('async');
var lmApi = require('./lib/lmApi');

var content = 'Le président ukrainien, Viktor Ianoukovitch, a annoncé, vendredi 21 février, une série de concessions, dont la tenue d\'une « élection présidentielle anticipée », dans le cadre d\'un accord de sortie de crise, négocié pendant près d\'une dizaine d\'heures sous l\'égide de l\'Union européenne. Dans le communiqué officiel publié sur le site de la présidence, M. Ianoukovitch accepte un retour à la Constitution de 2004, issue de la « révolution orange » et qui favorise le Parlement au détriment de la présidence, et la formation d\'un « gouvernement d\'union nationale ». En revanche, aucun mot n\'a été dit sur le moment où ces réformes verraient le jour.';

var articlesWithRubs = [];

function getRubriques(article, cb){

   lmApi.getArticle(article.id, function(apiItem){

      var rubriquesIds = apiItem.rubriques.map(function(rub){
         return rub.id;
      })

      articlesWithRubs.push({id: article.id, score:article.score, rubsIds: rubriquesIds})

      cb(null);
   });
};

/*
 *
 */

function KNearestRubriques(content, K, scoreWeight){

   var rubriques = {};
   var result = [];

   tagProposer.moreLikeThisContent(content, function (articles) {
      async.each(articles,  getRubriques, function(){
         console.log(articlesWithRubs);

         articlesWithRubs.forEach(function(article){

            article.rubsIds.forEach(function(rubId){
               if(rubriques[rubId] === undefined){
                  rubriques[rubId] = scoreWeight * article.score;
               }
               else{
                  rubriques[rubId] += scoreWeight * article.score;
               }
            });
         });

         //console.log(rubriques);

         Object.keys(rubriques).forEach(function(key){
            result.push({id: key, score:rubriques[key]})
         });

         result = result.sort(function(a,b){
            return a.score - b.score;
         });

         console.log(result);

      });
   });
}

KNearestRubriques(content, 10, 1);
