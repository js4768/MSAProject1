var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');
var mongoose_gen = require('mongoose-gen');
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
var studentJSON = JSON.parse(fs.readFileSync('schema.json', 'utf8'));
var studentSchema = new mongoose.Schema(mongoose_gen.convert(studentJSON));
var schemaList = [];  // a list to store all the schema in memory
for(var name in studentJSON) {
  schemaList.push(name);
}
var Student = mongoose.model('Student', studentSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.get('/student', function (req, res) {
  res.send('This is student service');
});

app.post('/student/add', function (req, res) {
  if(req.body == null) {
    res.status(400).send('Request body is empty!');
    return;
  }
  if(req.body.firstname == null || req.body.lastname == null) {
    res.status(400).send('Firstname and lastname must be valid');
    return;
  }
  var firstname = req.body.firstname,
      lastname = req.body.lastname,
      id = id_generator.generate_id(firstname, lastname);
  var newStudent = new Student({firstname:firstname, lastname:lastname, id:id});
  newStudent.save(function (err) {
    if(err) {
      console.log("Saving to db failed. Student: "+firstname+" "+lastname);
      res.send("Failed to save student to database.");
      return;
    }
  });
  res.send("A new student is added to database. Firstname: "+firstname+" Lastname: "+lastname+" ID: "+id);
});

app.get('/student/info', function (req, res) {
  if(req.query == null) {
    res.status(400).send('Request body is empty!');
    return;
  }
  // List all attribute to find non-existing ones
  for(var name in req.query) {
    var valid = false;
    for(var attribute in schemaList) {
      if(name == schemaList[attribute]) {
        valid = true;
        break;
      }
    }
    if(!valid) {
      console.error("/student/info received incorrect field");
      res.status(400).send("Bad request format");
      return;
    }
  }
  var qry = {};
  for(var param in req.query) {
    qry[param] = req.query[param];
  }
  Student.find(qry, function (err, result) {
    if(err) {
      console.error("/student/info failed with student id "+id);
      res.status(500).send("Internal errors");
      return;
    }
    res.send(result);
  });
});

app.delete('/student/delete', function (req, res) {
  if(req.body == null) {
    res.status(400).send('Request body is empty!');
    return;
  }
  if(req.body.id == null) {
    res.status(400).send('Must provide student ID');
    return;
  }
  var id = req.body.id;
  if(id.length != 6) {
    res.status(400).send('Invalid student ID');
    return;
  }
  Student.remove({id:id}, function (err) {
    if (err) {
      console.error("/student/delete failed with student id "+id);
      res.status(500).send("Internal errors");
      return;
    }
  });
  res.send("Delete student "+id);
});

app.post('/student/update', function (req, res) {
  if(req.body == null) {
    res.status(400).send('Request body is empty!');
    return;
  }
  if(req.body.id == null) {
    res.status(400).send('Must provide a student ID');
    return;
  }
  // Screen input fields
  for(var name in req.body) {
    var valid = false;
    for(var attribute in schemaList) {
      if(name == schemaList[attribute]) {
        valid = true;
        break;
      }
    }
    if(!valid) {
      console.error("/student/update received incorrect field");
      res.status(400).send("Bad request format");
      return;
    }
  }
  var update = {};
  var qry = {id: req.body.id};
  for(var param in req.body) {
    if(param!="id")
      update[param] = req.body[param];
  }
  var options = { multi: true };
  Student.update(qry, update, options, function (err, numAffected) {
    if(err || numAffected==0) {
      console.error("/student/update cannot update student "+req.body.id);
      res.status(500).send("Internal errors");
      return;
    }
  });
  Student.find(qry, function (err, result) {
    res.send("Student update: "+result);
  });
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