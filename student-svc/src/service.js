var jackrabbit = require('jackrabbit');

var rabbit = jackrabbit("amqp://dev.rabbitmq.com");
var exchange = rabbit.default();
var hello = exchange.queue({ name: 'deleteStudent' });




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

var modelIndex = 0;
// For localhost testing
var mongodb_ip = 'mongodb://0.0.0.0:27017';
// Docker Environment
/*var mongodb_ip = 'mongodb://'+process.env.MONGO_PORT_27017_TCP_ADDR+':'  +process.env.MONGO_PORT_27017_TCP_PORT;
fs.readFile(__dirname + '/config.xml', function(err, data) {
  parser.parseString(data, function (err, result) {
    mongodb_ip += result.config.mongodb;
    mongoose.connect(mongodb_ip);
    console.log("Connected to mongodb: "+mongodb_ip);
  });
});
*/
var connectWithRetry = function() {
  return mongoose.connect(mongodb_ip, function(err) {
    if (err) {
        console.error('Failed to connect to mongo on startup - retrying in 1 sec', err);
        setTimeout(connectWithRetry, 1000);
      }
  });
};
connectWithRetry();
console.log("Connect to Mongodb at "+mongodb_ip);
var studentJSON = JSON.parse(fs.readFileSync('schema.json', 'utf8'));
var studentSchema = new mongoose.Schema(mongoose_gen.convert(studentJSON), {strict:false});
var schemaList = [];  // a list to store all the schema in memory
for(var name in studentJSON) {
  schemaList.push(name);
}
var Student = mongoose.model('Student', studentSchema);//don't put name as Student+modelIndex initially... does not work




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


  //for every property in req.body
  for(var propName in req.body) {
    
    if (req.body.hasOwnProperty(propName)) {
      var valid = false;
      //console.log(propName, req.body[propName]); //property name and value
      //check if propName exists in schemaList
      for(var attribute in schemaList) {
        if(propName == schemaList[attribute]) {
          valid = true;
          break;
        }
      }

      if(!valid) {//propName was not present in schemaList
        console.error("/student/add received incorrect field. Field does not exist in schema: "+propName);
        res.status(400).send("Bad request format" + "/student/add received incorrect field. Field does not exist in schema: "+propName);
        return;
      }
    }
  }

  //all attributes in body are present in schemaList
  //add data to DB
  var id = id_generator.generate_id(req.body.firstname, req.body.lastname);
  
  //gets a unique ID
  var duplicate = function (id, Student) {
    Student.find({id:id}, function (err, result) {
      if(result.length>0) return false;
      else return true;
    });
  };
  
  while(duplicate(id, Student)) {
    id = id_generator.generate_id(req.body.firstname, req.body.lastname);
  }

  modelIndex++;
  Student = mongoose.model('Student'+modelIndex, studentSchema);
  var data = new Student();
  //console.log(studentSchema);
  for(var propName in req.body){

    data[propName] = req.body[propName];

  }
  console.log(data);

  //save the student
  //var newStudent = new Student({firstname:firstname, lastname:lastname, id:id});
  data.save(function (err) {
    if(err) {
      console.log("Saving to db failed. Student: "+req.body.firstname+" "+req.body.lastname);
      res.send("Failed to save student to database.");
      return;
    }
  });
  res.send("A new student is added to database. ID: "+id);
});



app.get('/student/info', function (req, res) {
  if(req.query == null) {
    res.status(400).send('Request body is empty!');
    return;
  }
  if(req.query['id'] == null) {
    res.status(400).send('Must provide student ID');
    return;
  }
  
  var fields = '';
  for	(index = 0; index < schemaList.length; index++) {
    fields += schemaList[index]+' ';
  }
  Student.find({id:req.query['id']}, fields, function (err, result) {
    if(err) {
      console.error("/student/info failed with student id "+id);
      res.status(500).send("Internal errors");
      return;
    }
    res.send(result);
  });
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
    if(param!="id") {
      update[param] = req.body[param];
    }
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

//POST - schema, type
app.post('/student/deleteSchema', function (req, res) {
  if(req.body==null) {
    res.status(400).send('Must have a parameter');
    return;
  }
  if(req.body.schema == null) {
    res.status(400).send('Must have a schema field');
    return;
  }
  if(req.body.type == null) {
    res.status(400).send('Must specify a type');
    return;
  }
  var tempSchemaList = [];
  var sch = req.body.schema;
  
  var schemaExists = false;

  for (index = 0; index < schemaList.length; index++) {
    if(sch == schemaList[index]) {
      schemaExists = true;
      break;
    }
  }
  if(!schemaExists){
    res.status(400).send('Column does not exist in schema: '+sch);
    return;
  }

  //if schema exists
  var index = schemaList.indexOf(sch);
  if (index > -1) {
      schemaList.splice(index, 1);
  }



  var key = sch;
  delete studentJSON[key];
  console.log(studentJSON);

  studentSchema = new mongoose.Schema(mongoose_gen.convert(studentJSON), {strict:false});
  
  // We are in docker. Writing to file doesn't pan out.
  fs.writeFile('schema.json', JSON.stringify(studentJSON));
  res.send("Schema removed: " +sch);

});


//POST - schema, type
app.post('/student/addSchema', function (req, res) {
  if(req.body==null) {
    res.status(400).send('Must have a parameter');
    return;
  }
  if(req.body.schema == null) {
    res.status(400).send('Must have a schema field');
    return;
  }
  if(req.body.type == null) {
    res.status(400).send('Must specify a type');
    return;
  }
  var tempSchemaList = [];
  var sch = req.body.schema;
  for	(index = 0; index < schemaList.length; index++) {
    if(sch == schemaList[index]) {
      res.status(400).send('Schema already exists.');
      return;
    }
  }
  schemaList.push(sch);
  studentJSON[sch] = req.body.type;

  console.log(studentJSON);
  studentSchema = new mongoose.Schema(mongoose_gen.convert(studentJSON), {strict:false});
  
  // We are in docker. Writing to file doesn't pan out.
  fs.writeFile('schema.json', JSON.stringify(studentJSON));
  res.send("Schema added: " +sch);

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

var server = app.listen(3000, "0.0.0.0", function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Student service listening at http://%s:%s', host, port);
});