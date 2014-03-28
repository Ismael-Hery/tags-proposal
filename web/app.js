"use strict";
var express = require('express');
var kNNRubriques = require('../lib/kNNRubriques');

var app = module.exports = express();

// Formulaires
app.use(express.bodyParser());

// Routing
app.use(app.router);

// Fichiers statiques
app.use(express.static(__dirname + '/public'));

// Templates
app.set('view engine', 'ejs');

/*
 * ROUTES
 */
app.post('/rubriques', rubriques);

function rubriques(req, res, next) {

   if (req.body.text === undefined || req.body.K === undefined || req.body.threshold === undefined)
      throw new Error('text and K and threshold must be defined');

   kNNRubriques.KNearestRubriques(req.body.text, req.body.K, req.body.threshold, function (rubriques) {
      console.log('RUBRIQUES', rubriques);

      res.send(rubriques);
   });

}
