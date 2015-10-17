var express = require('express');
var request = require('request');
var db = require('./model/db');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
app.use(bodyParser.json());

var router = express.Router();

router.post('/router/add', function(req, res) {
	var RoutingTable = mongoose.model('RoutingTable');
	//TODO Check for not nulls
	//TODO Check whether record already exists
	RoutingTable.create({
		httpMethod: req.body.httpMethod,
		service: req.body.service,
		api: req.body.api,
		keyName: req.body.keyName,
		keyLowerValue: req.body.keyLowerValue,
		keyUpperValue: req.body.keyUpperValue,
		ip: req.body.ip,
		port: req.body.port
	}, function(error, record) {
		if(!error) {
			console.log('new route added');
			res.status(200).send('Route added');
		} else {
			console.log('error while adding route');
			res.status(404).send('error while adding route');
		}
	});
});

router.post('/router/delete', function(req, res) {
	res.send('accessing /config/updateroute');
});

router.get('/router/get', function(req, res) {
	var RoutingTable = mongoose.model('RoutingTable');
	RoutingTable.find({}, function(error, routes) {
		if(!error) {
			console.log('Returning all routes');
			console.log(JSON.stringify(routes));
			res.writeHead(200, {"Content-Type": "application/json"});
  			res.end(JSON.stringify(routes));
		} else {
			console.log('error while fetching routes');
			res.status(404).send('Error while fetching routes');
		}
	});
});

router.post('/:service/:api', function(req, res) {
	var RoutingTable = mongoose.model('RoutingTable');
	
	RoutingTable.find({
		'httpMethod': 'post',
		'service': req.params.service,
		'api': req.params.api
	}, function(error, routes){
		if(error || routes.length < 1) {
			console.log('No route Found');
			res.status(404).send('Route Not Found');
			return;
		}

		console.log('routes found = ' + JSON.stringify(routes));
		if(routes.length == 1) {
			console.log('redirecting to = ' + routes[0].ip + ":" + routes[0].port + req.path);
			/*
			request(
				{
					url:routes[0].ip + ":" + routes[0].port + req.path,
					headers: req.headers,
					body: req.body
				}, 
				function(error, remoteResponse, remoteBody) {
					if (error) { 
						res.status(500).end('Error'); 
					} else {
						//TODO
    					//res.writeHead(...);
    					//res.end(remoteBody);
    				}
				} 
			);
			*/
			res.redirect(307, routes[0].ip + ":" + routes[0].port + req.path);
			return;
		}

		// keyName will be the same for all partitions
		var keyName = routes[0].keyName;
		console.log('keyName found = ' + keyName);

		if(req.body[keyName] != null && 
			req.body[keyName] != '') {
			var keyValue = (req.body[keyName]).charAt(0);
			console.log('keyValue = ' + keyValue);

			var route = _.find(routes, function(route) {
				if (route.keyLowerValue <= keyValue
					&& route.keyUpperValue >= keyValue) {
					return route;
				};
			})

			console.log('route found = ' + JSON.stringify(route));
			res.redirect(307, route.ip + ":" + route.port + req.path);
			return;
		}

		console.log('Key Not Found');
		res.status(404).send('Key Not Found');
	});
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