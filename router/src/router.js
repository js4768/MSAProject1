var express = require('express');
var request = require('request');
var db = require('./model/db');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var redirectUtil = require('./redirectUtil');
var routeUtil = require('./routeUtil');

var app = express();
app.use(bodyParser.json());

var router = express.Router();

router.post('/router/add', function(req, res) {
	routeUtil.createRoute(req, res);
});

router.post('/router/delete', function(req, res) {
	routeUtil.deleteRoute(req, res);
});

router.get('/router/get', function(req, res) {
	routeUtil.getRoutes(req, res);
});

router.post('/:service/:api', function(req, res) {
	var RoutingTable = mongoose.model('RoutingTable');
	redirectUtil.redirect(RoutingTable, req, res, 'post');
});

router.get('/:service/:api', function(req, res) {
	var RoutingTable = mongoose.model('RoutingTable');
	redirectUtil.redirect(RoutingTable, req, res, 'get');
});

router.get('/*', function(req, res) {
	res.status(404).send('Route Not Configured');
});

app.use('/', router);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});