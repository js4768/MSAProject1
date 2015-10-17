var _ = require('underscore');

module.exports.redirect = function(RoutingTable, req, res, httpMethod) {
	RoutingTable.find({
		'httpMethod': httpMethod,
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
};