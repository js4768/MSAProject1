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

var getRedirect = function(url, res, dontSendResponseBack) {
	if(dontSendResponseBack == 1) return;
	console.log('redirecting to = ' + url);
	res.redirect(url);
};

var otherRedirect = function(url, req, res, httpMethod, dontSendResponseBack) {
	console.log('req.headers = ' + JSON.stringify(req.headers));
	console.log('req.body = ' + JSON.stringify(req.body));
	var request = (httpMethod == 'post') ? unirest.post(url) 
										: unirest.delete(url);
	request.header('Content-Type','application/json')
		.send(req.body)
		.end(function(response) {
				console.log('response = ' + JSON.stringify(response));
				if(dontSendResponseBack == 1) return;
				res.status(response.statusCode)
				.send(JSON.stringify(response.body));
		});
};

var createRedirectRequest = function(url, req, res, httpMethod, dontSendResponseBack) {
	if(httpMethod == 'get') getRedirect(url, res);
	else if(httpMethod == 'post' || 
		httpMethod == 'delete') {
		otherRedirect(url, req, res, httpMethod, dontSendResponseBack);
	}
};

var redirectToRoute = function(route, req, res, httpMethod, dontSendResponseBack) {
	if(route == null) {
		console.log('Bad Input: Route Not Found for KeyValue');
		res.status(404).send('Bad Input: Route Not Found for KeyValue');
		return;
	}

	console.log('route found = ' + JSON.stringify(route));
	var url = 'http:\/\/' + route.ip + ":" + route.port + req.path;
	console.log('redirecting to = ' + url);
	createRedirectRequest(url, req, res, httpMethod, dontSendResponseBack);
};

var redirectToAllRoutes = function(routes, req, res, httpMethod) {
	_.each(routes, function(route) {
		redirectToRoute(route, req, res, httpMethod, 1);
	});
	res.status(200).send('Request sent to all partitions');
}

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

		if(routes[0].redirectAll) {
			console.log('before redirecting to all routes');
			redirectToAllRoutes(routes, req, res, httpMethod);
			console.log('redirected to all routes');
			return;
		}

		// keyName will be the same for all partitions
		var keyName = routes[0].keyName;
		console.log('keyName found = ' + keyName);

		if(req.body[keyName] == null || 
			req.body[keyName] == '') {
			console.log('Bad Input: Routing Key Not Found');
			res.status(404).send('Bad Input: Routing Key Not Found');
			return;
		}

		var keyValue = (req.body[keyName]).charAt(0);
		console.log('keyValue = ' + keyValue);

		var route = findRoute(routes, keyValue);
		redirectToRoute(route, req, res, httpMethod, 0);
	});
};