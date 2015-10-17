
var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/router';
mongoose.connect(dbURI);

mongoose.connection.on('connected', function() {
	console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', function(error) {
	console.log('Mongoose connection error: ' + error);
});

mongoose.connection.on('disconnected', function() {
	console.log('Mongoose disconnected');
});

process.on('SIGINT', function() {
	mongoose.connection.close(function() {
		console.log('Mongoose disconnected through app termination');
		process.exit(0);
	});
});

var RoutingTableSchema = new mongoose.Schema({
	httpMethod: String,
	service: String,
	api: String,
	keyName: String,
	keyLowerValue: String,
	keyUpperValue: String,
	ip: String,
	port: String
});

mongoose.model('RoutingTable', RoutingTableSchema);