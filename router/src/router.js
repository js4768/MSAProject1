var express = require('express');
var db = require('./model/db');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

var router = express.Router();

router.post('/api/:name', function(req, res) {
	console.log('accessing /api/:name');
	var APIToServiceTable = mongoose.model('APIToServiceTable');
	var query = APIToServiceTable.findOne({'api': req.params.name});
	query.exec(function(error, record) {
		if(error) {
			console.log('api found');
			res.send('api not found');
		} else {
			console.log('api found');
			res.send('api not found');
			//res.redirect();
		}
	})
});

router.post('/config/addroute', function(req, res) {
	var APIToServiceTable = mongoose.model('APIToServiceTable');
	APIToServiceTable.create({
		api: req.body.api,
		service: req.body.service
	}, function(error, record) {
		if(!error) {
			console.log('record saved');
			res.status(200).send('record saved');
		} else {
			console.log('error while creating record');
			res.status(404).send('error while creating record');
		}
	});
});

router.post('/config/updateroute', function(req, res) {
	res.send('accessing /config/updateroute');
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