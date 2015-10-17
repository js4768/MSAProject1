
var mongoose = require('mongoose');

module.exports.createRoute = function(req, res) {
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