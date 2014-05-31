var express = require('express');
var path = require('path');
var fs = require('fs');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var scrypt = require('scrypt');
var md5 = require('MD5');

var app = express();
app.use(bodyParser());

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

var COLLECTION_POSTS = 'plog_posts';
var COLLECTION_SESSION = 'plog_sessions';
var COLLECTION_USERS = 'plog_users';
var SESSION_TIMEOUT = 600;

var scryptParameters = scrypt.params(0.8);
scrypt.hash.config.keyEncoding = "ascii";
scrypt.hash.config.outputEncoding = "hex";
scrypt.verify.config.keyEncoding = "ascii";
scrypt.verify.config.hashEncoding = "hex";

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
    db.collection(COLLECTION_POSTS, function(er, collection) {
      collection.find({ 'appStarted': { '$exists' : true}}, {'appStarted': true}).toArray(function (e, docs) {
        db.close();
        res.send(docs);
      });
    });
  });
});

app.get('/plog', function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(COLLECTION_POSTS, function(er, collection) {
      collection.find({ 'title': { '$exists' : true}, 'content': { '$exists': true}}).toArray(function (e, docs) {
        db.close();
        if (docs)
          res.send(docs);
        else
          res.status(404).send([{title: "List Not Found", content: "No entries were found"}]);
      });
    });
  });
});

app.get('/plog/:title', function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(COLLECTION_POSTS, function(er, collection) {
      collection.findOne({ 'title': unescape(req.params.title) }, function (e, doc) {
        console.log('/plog/:title Diagnostics');
        console.log('title: ' + unescape(req.params.title));
        console.log('doc: ' + doc);
        console.log('e: ' + e);
        db.close();
        if (doc)
          res.send(doc);
        else
          res.send({title: "Resource Not Found", content: "No entry found by that title"});
      });
    });
  });
});

app.get('/login', function(req, res) {
  var user = unescape(req.query.user);
  var pass = unescape(req.query.pass);
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(COLLECTION_USERS, function(er, collection) {
      var cursor = collection.findOne({ 'user': user}, function (err, doc) {
        var login = scrypt.verify(doc.pass, pass);
        if (login) {
          var time = new Date();
          var microtime = time.getTime();
          var expires = microtime + 1000 * SESSION_TIMEOUT;
          var keyFeed = expires + '#' + user;
          var apikey = md5(keyFeed);
          var obj = { 'apiKey': apikey, 'expires': expires};
          db.collection(COLLECTION_SESSION, function(er, collection) {
            collection.insert(obj, {'safe':true}, function(err, objects) {
              if (err) {
                console.warn(err.message);
                res.status(500).send({ok: false});
              }
              if (err && err.message.indexOf('E11000 ') !== -1) {
                console.warn('ID already present in DB');
                res.status(500).send({ok: false});
              }
              db.close();
              res.send({'apiKey': apikey});
            });
          });
        }
        else {
          console.warn('Invalid Login: ' + user);
          res.status(403).send({ok: false});
        }
      });
    });
  });
});

app.post('/login', function(req, res) {
  var user = req.body.user;
  var pass = req.body.pass;
  var obj = {
    'user': user,
    'pass': scrypt.hash(pass, scryptParameters)
  };
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(COLLECTION_USERS, function(er, collection) {
      collection.insert(obj, {'safe':true}, function(err, objects) {
        if (err) {
          console.warn(err.message);
          res.status(500).send({ok: false});
        }
        if (err && err.message.indexOf('E11000 ') !== -1) {
          console.warn('ID already present in DB');
          res.status(500).send({ok: false});
        }
        db.close();
        res.send({'ok': true});
      });
    });
  });
});

app.post('/plog/:title', function(req, res) {
  var apikey = req.query.apiKey;
  var title = req.params.title;
  var content = req.body.content;
  var time = new Date();
  var obj = {
    'title': title,
    'content': content,
    'time': time
  };
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(COLLECTION_SESSION, function(er, collection) {
      collection.find({ 'apiKey': apikey}).toArray(function (e, docs) {
        if (e) {
          console.warn(err.message);
          res.status(500).send({ok: false});
        }
        if (docs.length == 1) {
          db.collection(COLLECTION_POSTS, function(er, collection) {
            collection.insert(obj, {'safe':true}, function(err, objects) {
              if (err) {
                console.warn(err.message);
                res.status(500).send({ok: false});
              }
              if (err && err.message.indexOf('E11000 ') !== -1) {
                console.warn('ID already present in DB');
                res.status(500).send({ok: false});
              }
              db.close();
              res.send({ok: true});
            });
          });
        }
        else {
          console.warn('API Key Invalid: ' + apikey);
          res.status(403).send({ok: false});
        }
      });
    });
  });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
