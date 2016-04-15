
module.exports = function(context){
    var wss          = context.wss;
    // var cookieParser = context.cookieParser;
    // var sessionStore = context.sessionStore;
    // var sessionKey   = context.sessionKey;
    var userMap  = new Object();

    var roomClients = new Object();



    var ROOM_TYPE_TUTORIAL = "RoomType.TUTORIAL";
    var ROOM_TYPE_LIVE = "RoomType.LIVE";


    //auth



    //connection
    wss.on('connection', function(ws) {     
        ws.on('close', function() {
            console.log('stopping client interval');
        });


        ws.on('message', function(message, flag) {
            console.log("*******");
            console.log("received Message ", message);

            var message = JSON.parse(message);

            if (message.cmd == "register") {
                console.log("register");
                if (userMap[message.uid]) {
                    userMap[message.uid].close();
                    delete userMap[message.uid];
                };
                userMap[message.uid] = ws;
                ws.uid = message.uid;
                ws.send(JSON.stringify({
                    clientId:message.uid
                }));
                return;
            };

            if (message.to) {
                console.log("resend message");
                sendHandler(this, message);
            };
        });

    });

    //event handler
    var sendHandler = function(ws, message) {
        wss.clients.forEach(function each(client) {
            if (client.uid == message.to) {
                client.send(JSON.stringify(message));
            };
        });
    }

    var inviteHandler = function(ws, message) {
  
    }


    var joinHandler = function(ws, message) {
   
    }

    var leaveHandler = function(ws, message) {
    
    }


    var rejectHandler = function(ws, message) {

    }

    var webrtcMessage = function(ws, message) {

    }



};