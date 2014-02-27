var tagProposer = require('./moreLikeThis');
var lmApi = require('./lmApi');

function getRubriquesFromArticles(idsAndScores, cb) {

   var articlesWithRubs = {};

   idsAndScores.forEach(function (idAndScore) {
      articlesWithRubs[idAndScore.id] = {score:idAndScore.score};
   });

   // On fait un seul appel à l'api avec tous les IDs
   lmApi.getArticles(Object.keys(articlesWithRubs), function (apiResult) {

      apiResult.data.forEach(function (item) {
         articlesWithRubs[item.id].rubs = [];

         if (item.rubriques !== undefined) {
            item.rubriques.forEach(function (rub) {
               articlesWithRubs[item.id].rubs.push({id:rub.id, label:rub.titre});
            });
         }
      });

      console.log('TOTO', articlesWithRubs);

      cb(null, articlesWithRubs);
   });
};

/*
 * Return an array of {id: XXX, score: XX, label: XXX} for each rubrique found amongst the K nearest articles of content
 * and with scoring above @param threshold
 */
exports.KNearestRubriques = KNearestRubriques;
function KNearestRubriques(content, K, threshold, cb) {

   var rubriquesWithScores = {};
   var result = [];

   tagProposer.moreLikeThisContent(content, K, function (articles) {
      getRubriquesFromArticles(articles, function (err, articlesWithRubs) {

         Object.keys(articlesWithRubs).forEach(function (articleId) {

            // Sometimes we did not found rubs because of API error
            if (articlesWithRubs[articleId].rubs !== undefined)
               articlesWithRubs[articleId].rubs.forEach(function (rub) {
                  if (rubriquesWithScores[rub.id] === undefined) {
                     rubriquesWithScores[rub.id] = {score:articlesWithRubs[articleId].score, label:rub.label}
                  }
                  else {
                     rubriquesWithScores[rub.id].score += articlesWithRubs[articleId].score;
                  }
               });


         });

         //console.log(rubriques);

         Object.keys(rubriquesWithScores).forEach(function (key) {
            if (rubriquesWithScores[key].score > threshold)
               result.push({id:key, score:rubriquesWithScores[key].score, label:rubriquesWithScores[key].label})
         });

         result = result.sort(function (a, b) {
            return b.score - a.score;
         });

         console.log('IN KNN', result);

         cb(result);

      });


   });
}

