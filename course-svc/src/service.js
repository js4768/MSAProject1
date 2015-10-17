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

//course
var courseJSON = JSON.parse(fs.readFileSync('course_schema.json', 'utf8'));
var courseSchema = new mongoose.Schema(mongoose_gen.convert(courseJSON));
var schemaList = [];  // a list to store all the schema in memory
for(var name in courseJSON) {
  schemaList.push(name);
}
var Course = mongoose.model('Course', courseSchema);



//course-student
var courseStudentJSON = JSON.parse(fs.readFileSync('course_student_schema.json', 'utf8'));
var courseStudentSchema = new mongoose.Schema(mongoose_gen.convert(courseStudentJSON));
var courseStudentSchemaList = [];  // a list to store all the schema in memory
for(var name in courseStudentJSON) {
  courseStudentSchemaList.push(name);
}
var CourseStudent = mongoose.model('CourseStudent', courseStudentSchema);



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.get('/course', function (req, res) {
  res.send('This is a course service');
});

app.post('/course/add', function (req, res) {
  if(req.body == null) {
    res.status(400).send('Request body is empty!');
    return;
  }
  if(req.body.coursename == null || req.body.venue == null) {
    res.status(400).send('Course name and venue must be valid');
    return;
  }
  var coursename = req.body.coursename,
      venue = req.body.venue,
      id = id_generator.generate_id(coursename);
  var newCourse = new Course({coursename:coursename, venue:venue, id:id});
  newCourse.save(function (err) {
    if(err) {
      console.log("Saving to db failed. Course: "+coursename+" "+venue);
      res.send("Failed to save course to database.");
      return;
    }
  });
  res.send("A new course is added to database. Course Name: "+coursename+" Venue: "+venue+" ID: "+id);
});





app.post('/course/addStudentToCourse', function (req, res) {
  if(req.body == null) {
    res.status(400).send('Request body is empty!');
    return;
  }
  if(req.body.courseID == null || req.body.studentID == null) {
    res.status(400).send('Course ID and Student ID must be valid');
    return;
  }
  var courseID = req.body.courseID,
      studentID = req.body.studentID,
      id = id_generator.generate_id(courseID, studentID);
  var newCourseStudent = new CourseStudent({courseID:courseID, studentID:studentID, id:id});
  newCourseStudent.save(function (err) {
    if(err) {
      console.log("Saving to db failed. Course ID: "+courseID+" Student ID: "+studentID);
      res.send("Failed to save student to course in database.");
      return;
    }
  });
  res.send("A new student is added to course in database. Course ID: "+courseID+" Student ID: "+studentID);
});




app.get('/course/info', function (req, res) {
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
      console.error("/course/info received incorrect field");
      res.status(400).send("Bad request format");
      return;
    }
  }
  var qry = {};
  for(var param in req.query) {
    qry[param] = req.query[param];
  }
  Course.find(qry, function (err, result) {
    if(err) {
      console.error("/course/info failed with course id "+id);
      res.status(500).send("Internal errors");
      return;
    }
    res.send(result);
  });
});

app.delete('/course/delete', function (req, res) {
  if(req.body == null) {
    res.status(400).send('Request body is empty!');
    return;
  }
  if(req.body.id == null) {
    res.status(400).send('Must provide course ID');
    return;
  }
  var id = req.body.id;
  if(id.length != 6) {
    res.status(400).send('Invalid course ID');
    return;
  }
  Course.remove({id:id}, function (err) {
    if (err) {
      console.error("/course/delete failed with course id "+id);
      res.status(500).send("Internal errors");
      return;
    }
  });
  res.send("Delete course "+id);
});


app.delete('/course/deleteStudentFromCourse', function (req, res) {
  if(req.body == null) {
    res.status(400).send('Request body is empty!');
    return;
  }
  
  if(req.body.courseID == null || req.body.studentID == null) {
    res.status(400).send('Course ID and Student ID must be provided');
    return;
  }

  var courseID = req.body.courseID;
  var studentID = req.body.studentID;
  if(courseID.length != 6 || studentID.length != 6 ) {
    res.status(400).send("Invalid course ID or student ID");
    return;
  }

  CourseStudent.remove({courseID:courseID , studentID:studentID}, function (err) {
    if (err) {
      console.error("/course/deleteStudentFromCourse failed with course id "+courseID + " and student ID" + studentID );
      res.status(500).send("Internal errors");
      return;
    }
  });
  res.send("Delete student " +studentID +" from course "+courseID);
});

app.post('/course/update', function (req, res) {
  if(req.body == null) {
    res.status(400).send('Request body is empty!');
    return;
  }
  if(req.body.id == null) {
    res.status(400).send('Must provide a course ID');
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
      console.error("/course/update received incorrect field");
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
  Course.update(qry, update, options, function (err, numAffected) {
    if(err || numAffected==0) {
      console.error("/course/update cannot update course "+req.body.id);
      res.status(500).send("Internal errors");
      return;
    }
  });
  Course.find(qry, function (err, result) {
    res.send("Course update: "+result);
  });
});

app.get('/course/getall', function (req, res) {
  Course.find({}).exec(function(err, result) {
    if (!err) {
      res.send(result);
    } else {
      console.error("/course/getall failed");
      res.status(500).send("Internal errors");
    };
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Course service listening at http://%s:%s', host, port);
});





