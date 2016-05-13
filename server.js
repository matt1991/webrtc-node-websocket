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

var crypto = require('crypto');

app.use(express.static(__dirname + '/public'));


var hmac = function(key, content) {
	var method = crypto.createHmac('sha1', key);
	method.setEncoding('base64');
	method.write(content);
	method.end();
	return method.read();
}

var flag = true;

app.get('/turn', function(req, resp) {


	var query = req.query;
	var key = '4080218913';
	if (!query['username']) {
	    return resp.send({'error':'AppError', 'message':'Must provide username.'});
	} else {
	    var time_to_live = 600;
	    var timestamp = Math.floor(Date.now() / 1000) + time_to_live;
	    var turn_username = timestamp + ':' + query['username'];
	    var password = hmac(key, turn_username);

		return resp.send({
			
			"iceServers": [
			    {
			      "urls": [
		 	           "turn:104.236.154.197:3478?transport=udp",
		 	           "turn:104.236.154.197:3478?transport=tcp",
		 	           "turn:104.236.154.197:3479?transport=udp",
		 	           "turn:104.236.154.197:3479?transport=tcp"
			      ],
			      username:turn_username,
		         	credential:password,
			    }
			  ]
		//     	    username:turn_username,
		//         	credential:password,
		//         	ttl:time_to_live,
		//         	urls: [
		// 	           "turn:104.236.154.197:3478?transport=udp",
		// 	           "turn:104.236.154.197:3478?transport=tcp",
		// 	           "turn:104.236.154.197:3479?transport=udp",
		// 	           "turn:104.236.154.197:3479?transport=tcp"
		//             ]
		//    		}
		});


	if (flag) {
		flag = false;
		return resp.send(
		// 		{
		//     	    username:turn_username,
		//         	credential:password,
		//         	ttl:time_to_live,
		//         	urls: [
		// 	           "turn:104.236.154.197:3478?transport=udp",
		// 	           "turn:104.236.154.197:3478?transport=tcp",
		// 	           "turn:104.236.154.197:3479?transport=udp",
		// 	           "turn:104.236.154.197:3479?transport=tcp"
		//             ]
		//    		}
		{
  "lifetimeDuration": "43200.000s",
  "iceServers": [
    {
      "urls": [
        "turn:173.194.72.127:19305?transport=udp",
        "turn:173.194.72.127:19305?transport=tcp",
        "turn:173.194.72.127:19305?transport=udp"
      ],
      "username": "1463146405:QhvIgP6F",
      "credential": "hUY8k+gFRugfBmH1TzdaioZYplw="
    }
  ]
}

					

		); 
	}else {
	    return resp.send(
		// 		{
		//     	    username:turn_username,
		//         	credential:password,
		//         	ttl:time_to_live,
		//         	urls: [
		// 	           "turn:104.236.154.197:3478?transport=udp",
		// 	           "turn:104.236.154.197:3478?transport=tcp",
		// 	           "turn:104.236.154.197:3479?transport=udp",
		// 	           "turn:104.236.154.197:3479?transport=tcp"
		//             ]
		//    		}
		{
  "lifetimeDuration": "43200.000s",
  "iceServers": [
    {
      "urls": [
        "turn:74.125.23.127:19305?transport=udp",
        "turn:74.125.23.127:19305?transport=tcp",
        "turn:173.194.72.127:19305?transport=udp"
      ],
      "username": "1463146438:56FlmRZH",
      "credential": "DujZx5NIkeoLPdBRaSJ/tFPOMBY="
    }
  ]
}
					
			

		);

}
	}
});

app.get('/mobileturn', function(req, resp) {


	var query = req.query;
	var key = '4080218913';
	if (!query['username']) {
	    return resp.send({'error':'AppError', 'message':'Must provide username.'});
	} else {
	    var time_to_live = 600;
	    var timestamp = Math.floor(Date.now() / 1000) + time_to_live;
	    var turn_username = timestamp + ':' + query['username'];
	    var password = hmac(key, turn_username);

	    return resp.send(
				{
		    	    username:turn_username,
		        	password:password,
		        	ttl:time_to_live,
		        	uris: [
			           "turn:104.236.154.197:3478?transport=udp",
			           "turn:104.236.154.197:3478?transport=tcp",
			           "turn:104.236.154.197:3479?transport=udp",
			           "turn:104.236.154.197:3479?transport=tcp"
		            ]
		   		}

		);
	}
});



//http
// var server = http.createServer(app);
// server.listen(8080);


// var wss = new WebSocketServer({server: server});
//https

var server = https.createServer(sslOptions, app);
server.listen(8089);
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
