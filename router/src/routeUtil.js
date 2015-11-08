
var mongoose = require('mongoose');

module.exports.createRoute = function(req, res, dontSendResponseBack) {
	if(req.body != null &&
		req.body.httpMethod != null && req.body.httpMethod != '' &&
		req.body.service != null && req.body.service != '' &&
		req.body.api != null && req.body.api != '' &&
		req.body.keyName != null && req.body.keyName != '' &&
		req.body.keyLowerValue != null && req.body.keyLowerValue != '' &&
		req.body.keyUpperValue != null && req.body.keyUpperValue != '' &&
		req.body.ip != null && req.body.ip != '' &&
		req.body.port != null && req.body.port != '' &&
		req.body.redirectAll != null && req.body.redirectAll != '') 
	{
		var keyLowerValue = req.body.keyLowerValue.charAt(0);
		var keyUpperValue = req.body.keyUpperValue.charAt(0);

		if(keyLowerValue < keyUpperValue && 
			keyLowerValue >= 'a' && keyUpperValue <= 'z') {

			console.log('checking for duplicate routes');

			var RoutingTable = mongoose.model('RoutingTable');
			RoutingTable.find({
				httpMethod: req.body.httpMethod,
				service: req.body.service,
				api: req.body.api,
				keyName: req.body.keyName,
				keyLowerValue: req.body.keyLowerValue,
				keyUpperValue: req.body.keyUpperValue,
				ip: req.body.ip,
				port: req.body.port,
				redirectAll: req.body.redirectAll
			}, function(error, routes) {
				if(routes.length == 0) {
					creatingRoute(req, res, dontSendResponseBack);
					console.log('Route Created');
				} else {
					console.log('Invalid add route request');
					if(dontSendResponseBack == 1) return;
					res.status(404).send('Invalid request, Check the request format and values.');
				}
			});
		} else {
			console.log('Invalid add route request');
			if(dontSendResponseBack == 1) return;
			res.status(404).send('Invalid request, Check the request format and values.');
		}
	} else {
		console.log('Invalid add route request');
		if(dontSendResponseBack == 1) return;
		res.status(404).send('Invalid request, Check the request format and values.');
	}
};

var creatingRoute = function(req, res, dontSendResponseBack) {
	var RoutingTable = mongoose.model('RoutingTable');
	RoutingTable.create({
		httpMethod: req.body.httpMethod,
		service: req.body.service,
		api: req.body.api,
		keyName: req.body.keyName,
		keyLowerValue: req.body.keyLowerValue,
		keyUpperValue: req.body.keyUpperValue,
		ip: req.body.ip,
		port: req.body.port,
		redirectAll: req.body.redirectAll
	}, function(error, record) {
		if(!error) {
			console.log('new route added');
			if(dontSendResponseBack == 1) return;
			res.status(200).send('Route added');
		} else {
			console.log('error while adding route');
			if(dontSendResponseBack == 1) return;
			res.status(404).send('error while adding route');
		}
	});
};

module.exports.creatingRoute = creatingRoute;

module.exports.getRoutes = function(req, res) {
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
};

module.exports.deleteRoute = function(req, res) {
	var RoutingTable = mongoose.model('RoutingTable');
	RoutingTable.remove({
		httpMethod: req.body.httpMethod,
		service: req.body.service,
		api: req.body.api,
		keyName: req.body.keyName,
		keyLowerValue: req.body.keyLowerValue,
		keyUpperValue: req.body.keyUpperValue,
		ip: req.body.ip,
		port: req.body.port,
		redirectAll: req.body.redirectAll
	}, function(error, record) {
		if(!error) {
			console.log('Route deleted');
			res.status(200).send('Route deleted');
		} else {
			console.log('error while deleting route');
			res.status(404).send('error while deleting route');
		}
	});
};