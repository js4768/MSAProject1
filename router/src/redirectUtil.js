var _ = require('underscore');
var unirest = require('unirest');

var findRoute = function(routes, keyValue) {
	_.find(routes, function(route) {
		if (route.keyLowerValue <= keyValue
			&& route.keyUpperValue >= keyValue) {
			return route;
		};
	})
};

var getRedirect = function(url, res) {
	console.log('redirecting to = ' + url);
	res.redirect(url);
};

var otherRedirect = function(url, req, res, httpMethod) {
	console.log('req.headers = ' + JSON.stringify(req.headers));
	console.log('req.body = ' + JSON.stringify(req.body));
	var request = (httpMethod == 'post') ? unirest.post(url) 
										: unirest.delete(url);
	request.header('Content-Type','application/json')
		.send(req.body)
		.end(function(response) {
				console.log('response = ' + JSON.stringify(response));
				res.status(response.statusCode)
				.send(JSON.stringify(response.body));
		});
};

var createRedirectRequest = function(url, req, res, httpMethod) {
	if(httpMethod == 'get') getRedirect(url, res);
	else if(httpMethod == 'post' || 
		httpMethod == 'delete') {
		otherRedirect(url, req, res, httpMethod);
	}
};

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
		// keyName will be the same for all partitions
		var keyName = routes[0].keyName;
		console.log('keyName found = ' + keyName);

		if(req.body[keyName] != null && 
			req.body[keyName] != '') {
			var keyValue = (req.body[keyName]).charAt(0);
			console.log('keyValue = ' + keyValue);

			var route = findRoute(routes, keyValue);

			console.log('route found = ' + JSON.stringify(route));
			var url = 'http:\/\/' + routes[0].ip + ":" + routes[0].port + req.path;
			console.log('redirecting to = ' + url);
			createRedirectRequest(url, req, res, httpMethod);
			return;
		}

		console.log('Key Not Found');
		res.status(404).send('Key Not Found');
	});
};