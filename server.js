var
  express = require('express'),
  server  = express(),
  fs      = require('fs');

server.use('/static', express.static(__dirname + '/static'));

server.get('/', function(req, res){
  fs.readFile('index.html', {encoding: 'utf8'}, function(err, data) {
    if (err) throw err;
    res.send(data);
  });
});

server.listen(1337);
console.log('Listening on port 1337');
