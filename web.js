var express = require('express');
var path = require('path');
var fs = require('fs');
var mongo = require('mongodb');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser());

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

var DB_NAME = 'plog';

mongo.Db.connect(mongoUri, function (err, db) {
  db.collection(DB_NAME, function(er, collection) {
    collection.insert({'appStarted': new Date()}, {'safe':true}, function(err, objects) {
      if (err) console.warn(err.message);
      if (err && err.message.indexOf('E11000 ') !== -1) {
        console.warn('ID already present in DB');
      }
      db.close();
    });
  });
});

app.get('/', function(req, res) {
  res.sendfile(path.join('public', 'index.html'));
});

app.get(/^\/([\w\-\.\/]*\.(?:html|css|js|gif|png|jpeg|jpg|ico))$/, function(req, res) {
  var filename = path.join('public', req.params[0]);
  fs.exists(filename, function(exists) {
    if (exists)
      res.sendfile(filename);
    else
      res.status(404).sendfile(path.join('public', '404.html'));
  })
});

app.get('/starts', function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(DB_NAME, function(er, collection) {
      collection.find({ 'appStarted': { '$exists' : true}}, {'appStarted': true}).toArray(function (e, docs) {
        db.close();
        res.send(docs);
      });
    });
  });
});

app.get('/plog', function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(DB_NAME, function(er, collection) {
      collection.find().toArray(function (e, docs) {
        db.close();
        res.send(docs);
      });
    });
  });
});

app.post('/plog', function(req, res) {
  var title = req.body.title;
  var content = req.body.content;
  var time = new Date();
  var obj = {
    'title': title,
    'content': content,
    'time': time
  };
  db.collection(DB_NAME, function(er, collection) {
    collection.insert(obj, {'safe':true}, function(err, objects) {
      if (err) console.warn(err.message);
      if (err && err.message.indexOf('E11000 ') !== -1) {
        console.warn('ID already present in DB');
      }
      db.close();
    });
  });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
