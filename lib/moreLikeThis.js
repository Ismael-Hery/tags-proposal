var request = require('superagent');
var _ = require('lodash');

exports.moreLikeThisContent = moreLikeThisContent;

/*
 * call cb({id: XX, score: YYY}) is an array of article Ids/More Like This Score close to @param content
 */
function moreLikeThisContent(content, neighborsNbr, cb) {

   console.log(content);

   var baseUrl = 'http://indexer1.lemonde.fr:8080/select';

   var mltParams = {
      use:'sept',
      qt:'mlt',
      rows:neighborsNbr,
      render:'json',
      "mlt.liketext":content
   };


   var idsAndScores = [];

   request.get(baseUrl).query(mltParams).end(function (err, res) {
      if(err){
         console.log("Problem while connecting to OSS");
         return;
      }

      if (res.ok) {

         //console.log(res.body.response.result.doc[0]);

         idsAndScores = res.body.response.result.doc.map(function (item) {

            return {
               id:item.field[0].value,
               score:item.score
            };

         });

         cb(idsAndScores);

      }
      else {
         console.log(res)
      }
   });

}
