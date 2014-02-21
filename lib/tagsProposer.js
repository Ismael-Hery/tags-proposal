var request = require('superagent');
var _ = require('lodash');

exports.moreLikeThis = moreLikeThis;

/*
 * call cb({id: XX, score: YYY}) is an array of article Ids/More Like This Score close to @param content
 */
function moreLikeThis(content, cb) {

   var contentA = 'Le président ukrainien, Viktor Ianoukovitch, a annoncé, vendredi 21 février, une série de concessions, dont la tenue d\'une « élection présidentielle anticipée », dans le cadre d\'un accord de sortie de crise, négocié pendant près d\'une dizaine d\'heures sous l\'égide de l\'Union européenne. Dans le communiqué officiel publié sur le site de la présidence, M. Ianoukovitch accepte un retour à la Constitution de 2004, issue de la « révolution orange » et qui favorise le Parlement au détriment de la présidence, et la formation d\'un « gouvernement d\'union nationale ». En revanche, aucun mot n\'a été dit sur le moment où ces réformes verraient le jour.';

   console.log(contentA);

   var baseUrl = 'http://indexer1.lemonde.fr:8080/select';

   var queryParams = {
      use:'sept',
      qt:'mlt',
      rows:'30',
      render:'json',
      "mlt.liketext":contentA
   };


   var ids = [];

   request.get(baseUrl).query(queryParams).end(function (res) {
      if (res.ok) {

         console.log(res.body.response.result.doc[0]);

         ids = res.body.response.result.doc.map(function (item) {

            return {
               id:item.field[0].value,
               score:item.score
            };

         });

         cb(ids);

      }
      else {
         console.log(res)
      }
   });

}
