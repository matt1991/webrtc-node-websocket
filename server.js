var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express();

var https = require('https');
var fs = require('fs');

var sslOptions = {
	key: fs.readFileSync('config/key.pem'),
	cert: fs.readFileSync('config/cert.pem')
};	

app.use(express.static(__dirname + '/public'));
//http
// var server = http.createServer(app);
// server.listen(8080);


// var wss = new WebSocketServer({server: server});
//https

var server = https.createServer(sslOptions, app);
server.listen(8080);
var wss = new WebSocketServer({server:server});
var context = {
  wss:wss
};

require('./websocket.js')(context);


// wss.on('connection', function(ws) {
//   var id = setInterval(function() {
//     ws.send(JSON.stringify(process.memoryUsage()), function() { /* ignore errors */ });
//   }, 100);
//   console.log('started client interval');
//   ws.on('close', function() {
//     console.log('stopping client interval');
//     clearInterval(id);
//   });
// });


//65651655