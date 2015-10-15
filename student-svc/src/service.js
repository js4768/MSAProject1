var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017');

var Student = mongoose.model('Student', {firstname: String, lastname: String});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.get('/student', function (req, res) {
  res.send('This is student service');
});

app.post('/student/add', function (req, res) {
  var firstname = req.body.firstname,
      lastname = req.body.lastname;
  res.send("A new student is added to database. Firstname: "+firstname+" Lastname: "+lastname);
});

app.get('/student/info', function (req, res) {
  var title = req.query['title'];
  res.send("Something about student "+title);
});

app.delete('/student/delete', function (req, res) {
  res.send("Delete a student "+req.body.title);
});

app.post('/student/update', function (req, res) {
  var title = req.body.title,
      room = req.body.room,
      prof = req.body.prof,
      time = req.body.time;
  if(prof == null) console.log("no prof");
  res.send('Title: '+title+' Room: '+room+' Prof: '+prof+' Time: '+time);
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Student service listening at http://%s:%s', host, port);
});