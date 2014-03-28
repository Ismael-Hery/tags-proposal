var moreLikeThis = require('./moreLikeThis');

var async = require('async');
var moment = require('moment');
var _ = require('underscore');

var lmApi = require('./lmApi');

var content = 'Le président ukrainien, Viktor Ianoukovitch, a annoncé, vendredi 21 février, une série de concessions, dont la tenue d\'une « élection présidentielle anticipée », dans le cadre d\'un accord de sortie de crise, négocié pendant près d\'une dizaine d\'heures sous l\'égide de l\'Union européenne. Dans le communiqué officiel publié sur le site de la présidence, M. Ianoukovitch accepte un retour à la Constitution de 2004, issue de la « révolution orange » et qui favorise le Parlement au détriment de la présidence, et la formation d\'un « gouvernement d\'union nationale ». En revanche, aucun mot n\'a été dit sur le moment où ces réformes verraient le jour.';

function getRubriques(article, cb) {

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

/*
 *
 */
exports.KNearestRubriques = KNearestRubriques;

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
      var ID = _.filter(content.fields, function(item) {
        return item.fieldName === 'item_id';
      });

      articlesIdsAndScores.push({
        id: ID[0].values[0],
        score: content.score
      });

    });

    console.log(articlesIdsAndScores);

    async.map(articlesIdsAndScores, getRubriques, function(err, articlesWithRubs) {

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
}