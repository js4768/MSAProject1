var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');
var id_generator = require('./id_generator');
var xml2js = require('xml2js');
var util = require('util');
var fs = require('fs');
var fileName = 'config.xml';
var parser = new xml2js.Parser();
var mongodb_ip = '';
fs.readFile(__dirname + '/config.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
      mongodb_ip += result.config.mongodb;
      mongoose.connect(mongodb_ip);
      console.log("Connected to mongodb: "+mongodb_ip);
    });
});

var Student = mongoose.model('Student', {firstname: String, 
                                         lastname: String, 
                                         id: String});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.get('/student', function (req, res) {
  res.send('This is student service');
});

app.post('/student/add', function (req, res) {
  if(req.body == null) {
    res.status(500).send('Request body is empty!');
  }
  if(req.body.firstname == null || req.body.lastname == null) {
    res.status(500).send('Bad request data!');
  }
  var firstname = req.body.firstname,
      lastname = req.body.lastname,
      id = id_generator.generate_id(firstname, lastname);
  var newStudent = new Student({firstname:firstname, lastname:lastname, id:id});
  newStudent.save(function (err) {
    if(err) {
      console.log("Saving to db failed. Student: "+firstname+" "+lastname);
      res.send("Failed to save student to database.");
    }
  });
  res.send("A new student is added to database. Firstname: "+firstname+" Lastname: "+lastname+" ID: "+id);
});

app.get('/student/info', function (req, res) {
  if(req.query == null) {
    res.status(500).send('Request body is empty!');
  }
  if(req.query['id'] == null) {
    res.status(500).send('Bad request data!');
  }
  // List all attribute to find non-existing ones
  for(var name in req.query) {
    console.log(name+"="+req.query[name]);
  }
  var firstname = req.query["firstname"],
      lastname = req.query["lastname"],
      id = req.query["id"];
  
  Student.find({id:id}, function (err, result) {
    if(err) {
      console.error("/student/info failed with student id "+id);
      res.status(400).send("Internal errors");
    }
    res.send("Something about student "+id+" "+result);
  });
});

app.delete('/student/delete', function (req, res) {
  if(req.body == null) {
    res.status(500).send('Request body is empty!');
  }
  if(req.body.id == null) {
    res.status(500).send('Bad request data!');
  }
  var id = req.body.id;
  Student.remove({id:id}, function (err) {
    if (err) {
      console.error("/student/delete failed with student id "+id);
      res.status(400).send("Internal errors");
    }
  });
  res.send("Delete a student "+req.body.id);
});

app.post('/student/update', function (req, res) {
  if(req.body == null) {
    res.status(500).send('Request body is empty!');
  }
  if(req.body.id == null) {
    res.status(500).send('Bad request data!');
  }
  var id = req.body.id;
  res.send("Info about student "+id);
});

app.get('/student/getall', function (req, res) {
  Student.find({}).exec(function(err, result) {
    if (!err) {
      res.send(result);
    } else {
      console.error("/student/getall failed");
      res.status(500).send("Internal errors");
    };
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Student service listening at http://%s:%s', host, port);
});