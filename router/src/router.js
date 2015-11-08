var express = require('express');
var db = require('./model/db');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var redirectUtil = require('./redirectUtil');
var routeUtil = require('./routeUtil');
var xml2js = require('xml2js');
var fs = require('fs');
var _ = require('underscore');

var xmlParser = new xml2js.Parser({explicitArray : false});

fs.readFile(__dirname + '/config.xml', function(err, data) {
  xmlParser.parseString(data, function (err, xmlData) {
  	var routes = xmlData['config']['route'];
  	_.each(routes, function(route) {
  		// console.log('route = ' + JSON.stringify(route));
  		routeUtil.createRoute(route, null, 1);
  	});
  });
});

var app = express();
app.use(bodyParser.json());

var router = express.Router();

router.post('/router/add', function(req, res) {
	routeUtil.createRoute(req, res, 0);
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

router.delete('/:service/:api', function(req, res) {
	var RoutingTable = mongoose.model('RoutingTable');
	redirectUtil.redirect(RoutingTable, req, res, 'delete');
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