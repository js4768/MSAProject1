
var mongoose = require('mongoose');

var checkNullOrExists = function(req) {
	if(req.body != null &&
		req.body.httpMethod != null && req.body.httpMethod != '' &&
		req.body.service != null && req.body.service != '' &&
		req.body.api != null && req.body.api != '' &&
		req.body.keyName != null && req.body.keyName != '' &&
		req.body.keyLowerValue != null && req.body.keyLowerValue != '' &&
		req.body.keyUpperValue != null && req.body.keyUpperValue != '' &&
		req.body.ip != null && req.body.ip != '' &&
		req.body.port != null && req.body.port != '') 
	{
		var keyLowerValue = req.body.keyLowerValue.charAt(0);
		var keyUpperValue = req.body.keyUpperValue.charAt(0);

		if(keyLowerValue < keyUpperValue && 
			keyLowerValue >= 'a' && keyUpperValue <= 'z') {

			var RoutingTable = mongoose.model('RoutingTable');
			RoutingTable.find({
				httpMethod: req.body.httpMethod,
				service: req.body.service,
				api: req.body.api,
				keyName: req.body.keyName,
				keyLowerValue: req.body.keyLowerValue,
				keyUpperValue: req.body.keyUpperValue,
				ip: req.body.ip,
				port: req.body.port
			}, function(error, routes) {
				if(routes.length == 0) return false;
			});
		}
	}
	return true;
};

module.exports.createRoute = function(req, res) {
	if(checkNullOrExists(req)) {
		console.log('Invalid add route request');
		res.status(404).send('Invalid request, Check the request format and values.');
		return;
	}

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
};

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
	//TODO Check for not nulls
	//TODO Check whether record already exists
	RoutingTable.remove({
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
			console.log('Route deleted');
			res.status(200).send('Route deleted');
		} else {
			console.log('error while deleting route');
			res.status(404).send('error while deleting route');
		}
	});
};