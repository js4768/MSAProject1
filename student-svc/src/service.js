var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.get('/course', function (req, res) {
  res.send('This is student service');
});

app.post('/course/add', function (req, res) {
  var title = req.body.title,
      room = req.body.room;
  res.send("A new course "+title+" will take place in Room "+room);
});

app.get('/course/info', function (req, res) {
  var title = req.query['title'];
  res.send("Something about course "+title);
});

app.delete('/course/delete', function (req, res) {
  res.send("Delete a course "+req.body.title);
});

app.post('/course/addStudent', function (req, res) {
  var studentID = req.body.SID,
      courseID = req.body.CID;
  res.send('A student '+studentID+' is added to course '+courseID);
});

app.post('/course/update', function (req, res) {
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

  console.log('Course service listening at http://%s:%s', host, port);
});