// Project: plog
// File: web.js
// Author: Len Payne
//
// Copyright 2014 Len Payne
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//== Imports of External Libraries
var express = require('express');
var path = require('path');
var fs = require('fs');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var scrypt = require('scrypt');
var md5 = require('MD5');

//== Setting Up the App
var app = express();
app.use(bodyParser());

//== Pseudo-Constant Declarations
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';
var COLLECTION_POSTS = 'plog_posts';
var COLLECTION_SESSION = 'plog_sessions';
var COLLECTION_USERS = 'plog_users';
var COLLECTION_CONFIG = 'plog_config';
var SESSION_TIMEOUT = 600;

//== Configuration for scrypt Hashing Module
var scryptParameters = scrypt.params(0.8);
scrypt.hash.config.keyEncoding = "ascii";
scrypt.hash.config.outputEncoding = "hex";
scrypt.verify.config.keyEncoding = "ascii";
scrypt.verify.config.hashEncoding = "hex";

//== Begin Section / => Static File Server ==
//===========================================

//== Default Route => Load the Homepage
app.get('/', function(req, res) {
  res.sendfile(path.join('public', 'index.html'));
});

//== "Web Server" Route => Translate Any File Request to Public Folder
app.get(/^\/([\w\-\.\/]*\.(?:html|css|js|gif|png|jpeg|jpg|ico|pdf))$/, function(req, res) {
  var filename = path.join('public', req.params[0]);
  fs.exists(filename, function(exists) {
    if (exists)
      res.sendfile(filename);
    else
      res.status(404).sendfile(path.join('public', '404.html'));
  })
});

//== Begin Section /plog => Store/Retrieve Posts ==
//=================================================

//== Get a List of All Posts
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

//== Get a Specific Post by Title (This is a Unique Index in DB)
app.get('/plog/:title', function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(COLLECTION_POSTS, function(er, collection) {
      collection.findOne({ 'title': unescape(req.params.title) }, function (e, doc) {
        db.close();
        if (doc)
          res.send(doc);
        else
          res.send({title: "Resource Not Found", content: "No entry found by that title"});
      });
    });
  });
});

//== Add/Edit a Post by Title
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
      collection.findOne({ 'apiKey': apikey}, function (e, doc) {
        if (e) {
          console.warn(e.message);
          res.status(500).send({ok: false});
        }
        else if (doc && doc.expires > (new Date())) {
          db.collection(COLLECTION_POSTS, function(er, collection) {
            collection.update({'title': obj.title}, obj, {'upsert':true}, function(err, objects) {
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
          console.warn('API Key Invalid or Expired: ' + apikey);
          res.status(403).send({ok: false});
        }
      });
    });
  });
});

//== Delete a Post by Title
app.del('/plog/:title', function(req, res) {
  var apikey = req.query.apiKey;
  var title = req.params.title;
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(COLLECTION_SESSION, function(er, collection) {
      collection.findOne({ 'apiKey': apikey}, function (e, doc) {
        if (e) {
          console.warn(e.message);
          res.status(500).send({ok: false});
        }
        else if (doc && doc.expires > (new Date())) {
          db.collection(COLLECTION_POSTS, function(er, collection) {
            collection.findAndRemove({'title': title}, [['title', 1]], function(err, doc) {
              if (err) {
                console.warn(err.message);
                res.status(500).send({ok: false});
              }
              db.close();
              res.send({ok: true});
            });
          });
        }
        else {
          console.warn('API Key Invalid or Expired: ' + apikey);
          res.status(403).send({ok: false});
        }
      });
    });
  });
});

//== Begin Section /login => Authenticate Login ==
//================================================

//== Authenticate a Single Username/Password Combo
app.get('/login', function(req, res) {
  var user = unescape(req.query.user);
  var pass = unescape(req.query.pass);
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(COLLECTION_USERS, function(er, collection) {
      var cursor = collection.findOne({ 'user': user}, function (err, doc) {
        if (doc && scrypt.verify(doc.pass, pass)) {
          var time = new Date();
          var microtime = time.getTime();
          var expires = microtime + 1000 * SESSION_TIMEOUT;
          var keyFeed = expires + '#' + user;
          var apikey = md5(keyFeed);
          var obj = { 'apiKey': apikey, 'expires': new Date(expires)};
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
          db.close();
        }
      });
    });
  });
});

//== Add a New Username/Password Combo
app.post('/login', function(req, res) {
  var user = req.body.user;
  var pass = req.body.pass;
  var obj = {
    'user': user,
    'pass': scrypt.hash(pass, scryptParameters)
  };
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(COLLECTION_CONFIG, function(er, collection) {
      collection.findOne({canRegister: {'$exists': true}}, function (e, doc) {
        db.close();
        if (doc && doc.canRegister) {
          mongo.Db.connect(mongoUri, function (err, db) {
            db.collection(COLLECTION_USERS, function(er, collection) {
              collection.insert(obj, {'safe':true}, function(err, objects) {
                if (err && err.message.indexOf('E11000 ') !== -1) {
                  console.warn('ID already present in DB');
                  res.status(500).send({ok: false});
                }
                else if (err) {
                  console.warn(err.message);
                  res.status(500).send({ok: false});
                }
                else
                  res.send({'ok': true});
                db.close();
              });
            });
          });
        }
        else
          res.status(403).send({ok: false});
      });
    });
  });

});

//== Begin Section /expire => Perform Logout ==
//=============================================

//== Force a Single Session to Expire
app.post('/expire/:apiKey', function(req, res) {
  var apikey = req.params.apiKey;
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(COLLECTION_SESSION, function(er, collection) {
      collection.findAndModify({ "apiKey": apikey}, [['expires', 'desc']], { "$set": {"expires": new Date()}}, function (e, doc) {
        if (e) {
          console.warn(e.message);
          res.status(500).send({ok: false});
        }
        else {
          res.send({ok: true});
        }
        db.close();
      });
    });
  });
});

//== Begin Section /config => Store/Retrieve Config ==
//====================================================

//== Retrieve a Copy of the Configuration Info
app.get('/config', function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection(COLLECTION_CONFIG, function(er, collection) {
      collection.findOne({canRegister: {'$exists': true}}, function (e, doc) {
        db.close();
        if (doc)
          res.send(doc);
        else
          res.status(404).send({ok: false});
      });
    });
  });
});

//== Begin Application Execution Section ==
//=========================================

//== Load the App and Listen on the Correct Port
var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
