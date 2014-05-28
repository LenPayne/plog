var express = require('express'),
  path = require('path');

var app = express();

app.get('/', function(req, res) {
  next('/index.html')
});

app.get(/^\/([\w\/]*\.(?:html|css|js|gif|png|jpeg|ico))$/, function(req, res) {
  var filename = path.join('public', req.params[0]);
  res.sendfile(filename);
})

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
