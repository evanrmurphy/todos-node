var fs = require('fs');
var http = require('http');

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  fs.readFile('index.html', {encoding: 'utf8'}, function(err, data) {
    if (err) throw err;
    res.end(data);
  });
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

