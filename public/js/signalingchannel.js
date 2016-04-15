/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* More information about these options at jshint.com/docs/options */

/* globals parseJSON, trace, sendUrlRequest, isChromeApp, RemoteWebSocket */
/* exported SignalingChannel */

'use strict';

// This class implements a signaling channel based on WebSocket.
var SignalingChannel = function(wssUrl) {
  this.wssUrl_ = wssUrl;
  this.clientId_ = null;
  this.toId_ = null;
  this.websocket_ = null;
  this.registered_ = true;

  // Public callbacks. Keep it sorted.
  this.onerror = null;
  this.onmessage = null;
  this.onregistermessage = null;
  this.oninvitemessage = null;
  this.onacceptmessage = null;
  this.onrejectmessage = null;
};

SignalingChannel.prototype.open = function() {
  if (this.websocket_) {
    trace('ERROR: SignalingChannel has already opened.');
    return;
  }

  trace('Opening signaling channel.');
  return new Promise(function(resolve, reject) {
    
    this.websocket_ = new WebSocket(this.wssUrl_);
    this.websocket_.onopen = function() {
      trace('Signaling channel opened.');

      this.websocket_.onerror = function() {
        trace('Signaling channel error.');
      };
      this.websocket_.onclose = function(event) {
        // TODO(tkchin): reconnect to WSS.
        trace('Channel closed with code:' + event.code +
            ' reason:' + event.reason);
        this.websocket_ = null;
        this.registered_ = false;
      };

      if (this.clientId_) {
        this.register(this.clientId_);
      }

      resolve();
    }.bind(this);

    this.websocket_.onmessage = function(event) {
      trace('WSS->C: ' + event.data);

      var message = parseJSON(event.data);
      if (!message) {
        trace('Failed to parse WSS message: ' + event.data);
        return;
      }

      if (message.register) {
        trace('register successfully');
        this.clientId_ = message.clientId;
        return;
      };

      if (message.type) {
        if (message.type == "accept") {
          this.toId_ = message.from;
          this.onacceptmessage();
        };

        if (message.type == "invite") {
          this.toId_ = message.from;
          console.log(message);
        };


        return;
      };


      if (message.error) {
        trace('Signaling server error message: ' + message.error);
        return;
      }
      this.onmessage(message.msg);
    }.bind(this);

    this.websocket_.onerror = function() {
      reject(Error('WebSocket error.'));
    };
  }.bind(this));
};

SignalingChannel.prototype.register = function(clientId) {
  this.clientId_ = clientId;

  if (!this.clientId_) {
    trace('ERROR: missing clientId.');
  }
  if (!this.websocket_ || this.websocket_.readyState !== WebSocket.OPEN) {
    trace('WebSocket not open yet; saving the IDs to register later.');
    return;
  }
  trace('Registering signaling channel.');
  var registerMessage = {
    cmd: 'register',
    uid: this.clientId_
  };
  this.websocket_.send(JSON.stringify(registerMessage));
  this.registered_ = true;

  // TODO(tkchin): Better notion of whether registration succeeded. Basically
  // check that we don't get an error message back from the socket.
  trace('Signaling channel registered.');
};

SignalingChannel.prototype.close = function(async) {
  if (this.websocket_) {
    this.websocket_.close();
    this.websocket_ = null;
  }

  if (!this.clientId_) {
    return;
  }

  return;
};

SignalingChannel.prototype.send = function(message) {
  if (!this.clientId_) {
    trace('ERROR: SignalingChannel has not registered.');
    return;
  }
  trace('C->WSS: ' + message);

  var wssMessage = {
    cmd: 'send',
    msg: message,
    from: this.clientId_,
    to: this.toId_,
  };
  var msgString = JSON.stringify(wssMessage);

  if (this.websocket_ && this.websocket_.readyState === WebSocket.OPEN) {
    this.websocket_.send(msgString);
  }
  
};

SignalingChannel.prototype.inviteRemoteUser = function(remoteUser) {
    this.toId_ = remoteUser;
    var message = {
        from: this.clientId_,
        to: this.toId_,
        type: "invite"
    }
    this.websocket_.send(JSON.stringify(message));
}

SignalingChannel.prototype.acceptInvitation = function() {
    var message = {
        from: this.clientId_,
        to: this.toId_,
        type: "accept"
    }
    this.websocket_.send(JSON.stringify(message));
}

SignalingChannel.prototype.rejectInvitation = function() {
    var message = {
        from: this.clientId_,
        to: this.toId_,
        type: "reject"
    }
    this.websocket_.send(JSON.stringify(message));
}
