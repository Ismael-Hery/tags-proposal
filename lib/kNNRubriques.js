var tagProposer = require('./moreLikeThis');
var async = require('async');
var lmApi = require('./lmApi');

var content = 'Le président ukrainien, Viktor Ianoukovitch, a annoncé, vendredi 21 février, une série de concessions, dont la tenue d\'une « élection présidentielle anticipée », dans le cadre d\'un accord de sortie de crise, négocié pendant près d\'une dizaine d\'heures sous l\'égide de l\'Union européenne. Dans le communiqué officiel publié sur le site de la présidence, M. Ianoukovitch accepte un retour à la Constitution de 2004, issue de la « révolution orange » et qui favorise le Parlement au détriment de la présidence, et la formation d\'un « gouvernement d\'union nationale ». En revanche, aucun mot n\'a été dit sur le moment où ces réformes verraient le jour.';

var articlesWithRubs = [];

function getRubriques(article, cb){

   lmApi.getArticle(article.id, function(apiItem){

      var rubriquesIds;

      if(apiItem.rubriques !== undefined)
      {
         rubriquesIds = apiItem.rubriques.map(function(rub){
            return rub.id;
         });

         articlesWithRubs.push({id: article.id, score:article.score, rubsIds: rubriquesIds})
      }

      cb(null);
   });
};

/*
 *
 */
exports.KNearestRubriques = KNearestRubriques;
function KNearestRubriques(content, K, scoreWeight, cb){

   var rubriques = {};
   var result = [];

   tagProposer.moreLikeThisContent(content, K, function (articles) {
      async.each(articles,  getRubriques, function(){

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
            return b.score - a.score;
         });

         console.log('IN KNN 1', result);

         result = result.map(function(item){
            return item.id;
         });

         console.log('IN KNN', result);

          cb(result);

      });
   });
}

