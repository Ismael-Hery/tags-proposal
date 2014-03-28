var moreLikeThis = require('./moreLikeThis');

var async = require('async');
var moment = require('moment');

var lmApi = require('./lmApi');

/**
 * Exports
 */
exports.KNearestRubriques = KNearestRubriques;

/**
 * Compute recommanded rubriques for that content
 * @param {String}   content   Content to retrieve recommended rubriques
 * @param {Integer}  K         Number of neighbors considered in knn algo, see http://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm
 * @param {Ineger}   threshold threshold for rubrique scoring
 * @param {Function} cb        callback
 */
function KNearestRubriques(content, K, threshold, cb) {

  var rubriques = {};
  var result = [];

  var mltOptions = {
    indexName: 'sept_ihe',
    searchFields: ['texte_exact'],
    returnedFields: ['item_id', 'item_titre'],
    from: moment().subtract('days', 365),
    dateFieldName: 'date_creation',
  };

  moreLikeThis.moreLikeThis(content, mltOptions, function(mltContent) {

    var articlesIdsAndScores = [];

    mltContent.forEach(function(content) {
      var ID = content.fields.filter(function(item) {
        return item.fieldName === 'item_id';
      });

      articlesIdsAndScores.push({
        id: ID[0].values[0],
        score: content.score
      });

    });

    console.log(articlesIdsAndScores);

    async.map(articlesIdsAndScores, addRubriques, function(err, articlesWithRubs) {

      articlesWithRubs.forEach(function(article) {

        article.rubs.forEach(function(rub) {
          if (rubriques[rub.id] === undefined) {
            rubriques[rub.id] = {
              score: article.score,
              label: rub.label
            }
          } else {
            rubriques[rub.id].score += article.score;
          }
        });
      });

      Object.keys(rubriques).forEach(function(key) {
        if (rubriques[key].score > threshold)
          result.push({
            id: key,
            score: rubriques[key].score,
            label: rubriques[key].label
          })
      });

      result = result.sort(function(a, b) {
        return b.score - a.score;
      });

      cb(result);

    });
  });

  /**
   * Get rubrique given an article from LMFR API
   * @param  {Object]}   article article with id and score
   * @param  {Function} cb      callback with new object that contains initial ids, score, and also rubs
   */
  function addRubriques(article, cb) {

    lmApi.getArticle(article.id, function(apiItem) {

      var rubs = [];

      if (apiItem.rubriques !== undefined) {
        rubs = apiItem.rubriques.map(function(rub) {
          return {
            id: rub.id,
            label: rub.titre
          };
        });

      }

      cb(null, {
        id: article.id,
        score: article.score,
        rubs: rubs
      });

    });
  };

}