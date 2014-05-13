var moreLikeThis = require('./moreLikeThis');

var async = require('async');
var moment = require('moment');

var lmApi = require('./lmApi');

/**
 * Exports
 */
exports.KNearestNeighbors = KNearestNeighbors;

/**
 * Compute recommanded rubriques for that content
 * @param {String}   content    Content to retrieve recommended rubriques
 * @param {Integer}  K          Number of neighbors considered in knn algo, see http://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm
 * @param {Integer}   threshold threshold for rubrique scoring
 * @param {String rubOrEns      say if we look for recommended 'rubriques' or 'ensembles'
 * @param {Function} cb         callback
 */
function KNearestNeighbors(content, K, threshold, rubOrEns, cb) {
  var rubriquesFromDays = 365;
  var ensemblesFromDays = 90;

  var mltOptions = {
    indexName: 'sept',
    searchFields: ['texte_exact'],
    returnedFields: ['item_id', 'item_titre'],
    dateFieldName: 'date_creation',
    typeItem: 4
  };

  if (rubOrEns === 'rubriques') {
    mltOptions.from = moment().subtract('days', rubriquesFromDays);
    KNearest(content, K, threshold, 'rubriques', mltOptions, cb)
  } else if (rubOrEns === 'ensembles') {
    mltOptions.from = moment().subtract('days', ensemblesFromDays);
    KNearest(content, K, threshold, 'ensembles', mltOptions, cb)
  }

};

/**
 * Compute recommanded rubriques for that content
 * @param {String}   content   Content to retrieve recommended rubriques
 * @param {Integer}  K         Number of neighbors considered in knn algo, see http://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm
 * @param {Ineger}   threshold threshold for rubrique scoring
 * @param {Function} cb        callback
 */
function KNearest(content, K, threshold, rubOrEns, mltOptions, cb) {
  var rubriques = {};
  var result = [];

  moreLikeThis.moreLikeThis(content, mltOptions, function(mltContent) {

    //console.log('MLCONTENT', mltContent);

    var articlesIdsAndScores = [];

    // transform mlContent to something easier to work: articles Ids and Score
    mltContent.forEach(function(content) {
      var ID = content.fields.filter(function(item) {
        return item.fieldName === 'item_id';
      });

      articlesIdsAndScores.push({
        id: ID[0].values[0],
        score: content.score
      });

    });

    //console.log('ARTICLES IDs AND SCOREs',articlesIdsAndScores);

    var enrich;

    if(rubOrEns === 'rubriques')
      enrich = addRubriques;
    else
      enrich = addEnsembles;

    async.map(articlesIdsAndScores, enrich, function addRubriquesInfo(err, articlesWithRubs) {

      if (err) {
        console.log('Error in adding rubriques infos');
        throw new Error('Error in adding rubriques infos');
      }

      console.log('ARTICLES WITH RUBS', articlesWithRubs);

      // build all Rubriques Object by summing rubriques scores from the nearest articles
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

      // build end result as array of rub id/score/label
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
   * Add rubrique given an article from LMFR API
   * @param  {Object}   article article with id and score to which we add rubriques infos in 'rubs' object property (with rubrique id and rubrique titre)
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

  /**
   * Add ensembles given an article from LMFR API
   * @param  {Object}   article article with id and score to which we add rubriques infos in 'rubs' object property (with rubrique id and rubrique titre)
   * @param  {Function} cb      callback with new object that contains initial ids, score, and also rubs
   */
  function addEnsembles(article, cb) {

    lmApi.getEnsembles(article.id, function(response) {

      var ensembles = [];

      if (response.data.length > 0) {
        ensembles = response.data.map(function(ensemble) {
          return {
            id: ensemble.id,
            label: ensemble.tetiere
          };
        });

      }

      cb(null, {
        id: article.id,
        score: article.score,
        rubs: ensembles
      });

    });
  };

}
