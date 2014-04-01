"use strict";
var express = require('express');
var moment = require('moment');

var kNNRubriques = require('../lib/kNNRubriques');
var moreLikeThis = require('../lib/moreLikeThis');
var lmApi = require('../lib/lmApi');

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
app.get('/', home);
app.post('/depeches', depeches);
app.post('/rubriques', rubriques);
app.post('/ensembles', ensembles);
app.post('/articles', articles);
app.post('/videos', videos);

/**
 * CONTROLLERS
 */
function home(req, res, next) {
   res.render('index');
};

function rubriques(req, res, next) {

  if (req.body.text === undefined || req.body.K === undefined || req.body.threshold === undefined)
    throw new Error('text and K and threshold must be defined');

  kNNRubriques.KNearestNeighbors(req.body.text, req.body.K, req.body.threshold, 'rubriques', function(rubriques) {
    console.log('RUBRIQUES', rubriques)

    res.send(rubriques);
  });

};

function ensembles(req, res, next) {

  if (req.body.text === undefined || req.body.K === undefined || req.body.threshold === undefined)
    throw new Error('text and K and threshold must be defined');

  kNNRubriques.KNearestNeighbors(req.body.text, req.body.K, req.body.threshold, 'ensembles', function(ensembles) {
    console.log('ENSEMBLES', ensembles)

    res.send(ensembles);
  });

};

function articles(req, res, next) {
  item(req, res, next, 4);
};

function videos(req, res, next) {
  item(req, res, next, 13);
};

function depeches(req, res, next) {
  if (req.body.text === undefined)
    throw new Error('text must be defined');

  var mltOptions = {
    indexName: 'depeches',
    searchFields: ['title_standard', 'content_standard'],
    returnedFields: ['id', 'date','title','provider'],
    from: moment().subtract('days', 3),
    dateFieldName: 'date'
  };

  moreLikeThis.moreLikeThis(req.body.text, mltOptions, function(articles) {

    var result = [];

    // Format data comming from OSS more like this + retrieve article URl
    articles.forEach(function(article) {
      var id = article.fields.filter(function(item) {
        return item.fieldName === 'id';
      })[0].values[0];

      var date = article.fields.filter(function(item) {
        return item.fieldName === 'date';
      })[0].values[0];

      var title = article.fields.filter(function(item) {
        return item.fieldName === 'title';
      })[0].values[0];

      var provider = article.fields.filter(function(item) {
        return item.fieldName === 'provider';
      })[0].values[0];

      result.push({
        score: article.score,
        id: id,
        title: title,
        date: date,
        provider: provider
      });

    });

    res.send(result);
  });
};

function item(req, res, next, typeItem) {
  if (req.body.text === undefined)
    throw new Error('text must be defined');

  var mltOptions = {
    indexName: 'sept_ihe',
    searchFields: ['texte_exact', 'item_titre_exact'],
    returnedFields: ['item_id', 'item_titre', 'date_creation', 'date_publication'],
    from: moment().subtract('days', 365),
    dateFieldName: 'date_creation',
    typeItem: typeItem
  };

  moreLikeThis.moreLikeThis(req.body.text, mltOptions, function(articles) {

    var result = [];

    // Format data comming from OSS more like this + retrieve article URl
    articles.forEach(function(article) {
      var item_id = article.fields.filter(function(item) {
        return item.fieldName === 'item_id';
      })[0].values[0];

      var item_titre = article.fields.filter(function(item) {
        return item.fieldName === 'item_titre';
      })[0].values[0];

      var date_publication = article.fields.filter(function(item) {
        return item.fieldName === 'date_publication';
      })[0].values[0];

      result.push({
        score: article.score,
        item_id: item_id,
        item_titre: item_titre,
        date_publication: date_publication
      });

    });

    res.send(result);
  });

};
