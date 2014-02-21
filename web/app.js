"use strict";
var express = require('express');
var kNNRubriques = require('../lib/kNNRubriques');

var app = module.exports = express();

// Formulaires
app.use(express.bodyParser());

// Routing
app.use(app.router);

/*
 * ROUTES
 */
app.post('/rubriques', rubriques);

function rubriques(req, res, next) {

   kNNRubriques.KNearestRubriques(req.body.text, req.body.K,function(rubriques){
      console.log('RUBRIQUES', rubriques);

      res.send(rubriques);
   });

}
