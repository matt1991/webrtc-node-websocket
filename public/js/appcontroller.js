/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* More information about these options at jshint.com/docs/options */

/* globals adapter, trace, InfoBox, setUpFullScreen, isFullScreen,
   RoomSelection, isChromeApp, $ */
/* exported AppController, remoteVideo */

'use strict';

// TODO(jiayl): remove |remoteVideo| once the chrome browser tests are updated.
// Do not use in the production code.
var remoteVideo = $('#remote-video');

// Keep this in sync with the HTML element id attributes. Keep it sorted.
var UI_CONSTANTS = {
  confirmJoinButton: '#confirm-join-button',
  confirmJoinDiv: '#confirm-join-div',
  confirmJoinRoomSpan: '#confirm-join-room-span',
  fullscreenSvg: '#fullscreen',
  hangupSvg: '#hangup',
  icons: '#icons',
  infoDiv: '#info-div',
  localVideo: '#local-video',
  miniVideo: '#mini-video',
  muteAudioSvg: '#mute-audio',
  muteVideoSvg: '#mute-video',
  newRoomButton: '#new-room-button',
  newRoomLink: '#new-room-link',
  privacyLinks: '#privacy',
  remoteVideo: '#remote-video',
  rejoinButton: '#rejoin-button',
  rejoinDiv: '#rejoin-div',
  rejoinLink: '#rejoin-link',
  roomLinkHref: '#room-link-href',
  roomSelectionDiv: '#room-selection',
  roomSelectionInput: '#room-id-input',
  roomSelectionInputLabel: '#room-id-input-label',
  roomSelectionJoinButton: '#join-button',
  roomSelectionRandomButton: '#random-button',
  roomSelectionRecentList: '#recent-rooms-list',
  sharingDiv: '#sharing-div',
  statusDiv: '#status-div',
  videosDiv: '#videos',



  registerButton: '#register-button',
  callButton: '#call-button',
  answerButton: '#answer-button',
  rejectButton: '#reject-button',
  registerText: '#register-text',
  callText:'#call-text'
};

// The controller that connects the Call with the UI.
var AppController = function(loadingParams) {
  trace('Initializing; server= ' + loadingParams.roomServer + '.');
  trace('Initializing; room=' + loadingParams.roomId + '.');

  this.hangupSvg_ = $(UI_CONSTANTS.hangupSvg);
  this.icons_ = $(UI_CONSTANTS.icons);
  this.localVideo_ = $(UI_CONSTANTS.localVideo);
  this.miniVideo_ = $(UI_CONSTANTS.miniVideo);
  this.sharingDiv_ = $(UI_CONSTANTS.sharingDiv);
  this.statusDiv_ = $(UI_CONSTANTS.statusDiv);
  this.remoteVideo_ = $(UI_CONSTANTS.remoteVideo);
  this.videosDiv_ = $(UI_CONSTANTS.videosDiv);
  this.roomLinkHref_ = $(UI_CONSTANTS.roomLinkHref);
  this.rejoinDiv_ = $(UI_CONSTANTS.rejoinDiv);
  this.rejoinLink_ = $(UI_CONSTANTS.rejoinLink);
  this.newRoomLink_ = $(UI_CONSTANTS.newRoomLink);
  this.rejoinButton_ = $(UI_CONSTANTS.rejoinButton);
  this.newRoomButton_ = $(UI_CONSTANTS.newRoomButton);

  //added by matt
  this.registerButton_ = $(UI_CONSTANTS.registerButton);
  this.callButton_ = $(UI_CONSTANTS.callButton);
  this.answerButton_ = $(UI_CONSTANTS.answerButton);
  this.rejectButton_ = $(UI_CONSTANTS.rejectButton);
  this.registerText_ = $(UI_CONSTANTS.registerText);
  this.callText_ = $(UI_CONSTANTS.callText);


  //added by matt
  this.registerButton_.addEventListener('click', this.onRegisterButtonClick_.bind(this), false);
  this.callButton_.addEventListener('click', this.onCallButtonClick_.bind(this), false);
  this.answerButton_.addEventListener('click', this.onAnswerButtonClick_.bind(this), false);

  this.rejectButton_.addEventListener('click', this.onRejectButtonClick_.bind(this), false);



  this.muteAudioIconSet_ =
      new AppController.IconSet_(UI_CONSTANTS.muteAudioSvg);
  this.muteVideoIconSet_ =
      new AppController.IconSet_(UI_CONSTANTS.muteVideoSvg);
  this.fullscreenIconSet_ =
      new AppController.IconSet_(UI_CONSTANTS.fullscreenSvg);




  this.loadingParams_ = loadingParams;
  this.loadUrlParams_();

  this.call_ = new Call(this.loadingParams_);


  // TODO(jiayl): replace callbacks with events.
  this.call_.onremotehangup = this.onRemoteHangup_.bind(this);
  this.call_.onremotesdpset = this.onRemoteSdpSet_.bind(this);
  this.call_.onremotestreamadded = this.onRemoteStreamAdded_.bind(this);
  this.call_.onlocalstreamadded = this.onLocalStreamAdded_.bind(this);

  var paramsPromise = Promise.resolve({});
  if (this.loadingParams_.paramsFunction) {
    // If we have a paramsFunction value, we need to call it
    // and use the returned values to merge with the passed
    // in params. In the Chrome app, this is used to initialize
    // the app with params from the server.
    paramsPromise = this.loadingParams_.paramsFunction();
  }

  Promise.resolve(paramsPromise).then(function(newParams) {
    // Merge newly retrieved params with loadingParams.
    if (newParams) {
      Object.keys(newParams).forEach(function(key) {
        this.loadingParams_[key] = newParams[key];
      }.bind(this));
    }

    this.roomLink_ = '';
    this.roomSelection_ = null;
    this.localStream_ = null;
    this.remoteVideoResetTimer_ = null;

    // If the params has a roomId specified, we should connect to that room
    // immediately. If not, show the room selection UI.
    this.finishCallSetup_();

  }.bind(this)).catch(function(error) {
    trace('Error initializing: ' + error.message);
  }.bind(this));
};

AppController.prototype.createCall_ = function() {
  var privacyLinks = $(UI_CONSTANTS.privacyLinks);
  this.hide_(privacyLinks);
  this.call_ = new Call(this.loadingParams_);


  

  // this.call_.onsignalingstatechange =
  //     this.infoBox_.updateInfoDiv.bind(this.infoBox_);
  // this.call_.oniceconnectionstatechange =
  //     this.infoBox_.updateInfoDiv.bind(this.infoBox_);
  // this.call_.onnewicecandidate =
  //     this.infoBox_.recordIceCandidateTypes.bind(this.infoBox_);

  // this.call_.onerror = this.displayError_.bind(this);
  // this.call_.onstatusmessage = this.displayStatus_.bind(this);
  // this.call_.oncallerstarted = this.displaySharingInfo_.bind(this);
};


//added by matt

AppController.prototype.onRegisterButtonClick_ = function() {
  
  var userName = this.registerText_.value;

  this.call_.register(userName);
}


AppController.prototype.onCallButtonClick_ = function() {
  this.call_.inviteRemoteUser(this.callText_.value);
}

AppController.prototype.onRejectButtonClick_ = function() {

}

AppController.prototype.onAnswerButtonClick_ = function() {
  this.call_.acceptInvitation();
}




AppController.prototype.finishCallSetup_ = function() {

  this.iconEventSetup_();
  document.onkeypress = this.onKeyPress_.bind(this);
  window.onmousemove = this.showIcons_.bind(this);

  $(UI_CONSTANTS.muteAudioSvg).onclick = this.toggleAudioMute_.bind(this);
  $(UI_CONSTANTS.muteVideoSvg).onclick = this.toggleVideoMute_.bind(this);
  $(UI_CONSTANTS.fullscreenSvg).onclick = this.toggleFullScreen_.bind(this);
  $(UI_CONSTANTS.hangupSvg).onclick = this.hangup_.bind(this);

  setUpFullScreen();

    // Call hangup with async = false. Required to complete multiple
    // clean up steps before page is closed.
    // Chrome apps can't use onbeforeunload.
    window.onbeforeunload = function() {
      this.call_.hangup(false);
    }.bind(this);

    window.onpopstate = function(event) {
      if (!event.state) {
        // TODO (chuckhays) : Resetting back to room selection page not
        // yet supported, reload the initial page instead.
        trace('Reloading main page.');
        location.href = location.origin;
      } else {
        // This could be a forward request to open a room again.
        if (event.state.roomLink) {
          location.href = event.state.roomLink;
        }
      }
    };
  
};

AppController.prototype.hangup_ = function() {
  trace('Hanging up.');
  this.hide_(this.icons_);
  this.displayStatus_('Hanging up');
  this.transitionToDone_();

  // Call hangup with async = true.
  this.call_.hangup(true);
};

AppController.prototype.onRemoteHangup_ = function() {
  this.displayStatus_('The remote side hung up.');
  this.transitionToWaiting_();

  this.call_.onRemoteHangup();
};

AppController.prototype.onRemoteSdpSet_ = function(hasRemoteVideo) {
  if (hasRemoteVideo) {
    trace('Waiting for remote video.');
    this.waitForRemoteVideo_();
  } else {
    trace('No remote video stream; not waiting for media to arrive.');
    // TODO(juberti): Make this wait for ICE connection before transitioning.
    this.transitionToActive_();
  }
};

AppController.prototype.waitForRemoteVideo_ = function() {
  // Wait for the actual video to start arriving before moving to the active
  // call state.
  if (this.remoteVideo_.readyState >= 2) {  // i.e. can play
    trace('Remote video started; currentTime: ' +
          this.remoteVideo_.currentTime);
    this.transitionToActive_();
  } else {
    this.remoteVideo_.oncanplay = this.waitForRemoteVideo_.bind(this);
  }
};

AppController.prototype.onRemoteStreamAdded_ = function(stream) {
  trace('Remote stream added.');
  adapter.browserShim.attachMediaStream(this.remoteVideo_, stream);

  if (this.remoteVideoResetTimer_) {
    clearTimeout(this.remoteVideoResetTimer_);
    this.remoteVideoResetTimer_ = null;
  }
};

AppController.prototype.onLocalStreamAdded_ = function(stream) {
  trace('User has granted access to local media.');
  this.localStream_ = stream;

    this.attachLocalStream_();
  
};

AppController.prototype.attachLocalStream_ = function() {
  trace('Attaching local stream.');

  // Call the polyfill wrapper to attach the media stream to this element.
  adapter.browserShim.attachMediaStream(this.localVideo_, this.localStream_);

  this.displayStatus_('');
  this.activate_(this.localVideo_);
  this.show_(this.icons_);
  if (this.localStream_.getVideoTracks().length === 0) {
    this.hide_($(UI_CONSTANTS.muteVideoSvg));
  }
  if (this.localStream_.getAudioTracks().length === 0) {
    this.hide_($(UI_CONSTANTS.muteAudioSvg));
  }
};

AppController.prototype.transitionToActive_ = function() {
  // Stop waiting for remote video.
  this.remoteVideo_.oncanplay = undefined;
  var connectTime = window.performance.now();

  trace('Call setup time: ' + (connectTime - this.call_.startTime).toFixed(0) +
      'ms.');

  // Prepare the remote video and PIP elements.
  trace('reattachMediaStream: ' + this.localVideo_.src);
  adapter.browserShim.reattachMediaStream(this.miniVideo_, this.localVideo_);

  // Transition opacity from 0 to 1 for the remote and mini videos.
  this.activate_(this.remoteVideo_);
  this.activate_(this.miniVideo_);
  // Transition opacity from 1 to 0 for the local video.
  this.deactivate_(this.localVideo_);
  this.localVideo_.src = '';
  // Rotate the div containing the videos 180 deg with a CSS transform.
  this.activate_(this.videosDiv_);
  this.show_(this.hangupSvg_);
  this.displayStatus_('');
};

AppController.prototype.transitionToWaiting_ = function() {
  // Stop waiting for remote video.
  this.remoteVideo_.oncanplay = undefined;

  this.hide_(this.hangupSvg_);
  // Rotate the div containing the videos -180 deg with a CSS transform.
  this.deactivate_(this.videosDiv_);

  if (!this.remoteVideoResetTimer_) {
    this.remoteVideoResetTimer_ = setTimeout(function() {
      this.remoteVideoResetTimer_ = null;
      trace('Resetting remoteVideo src after transitioning to waiting.');
      this.remoteVideo_.src = '';
    }.bind(this), 800);
  }

  // Set localVideo.src now so that the local stream won't be lost if the call
  // is restarted before the timeout.
  this.localVideo_.src = this.miniVideo_.src;

  // Transition opacity from 0 to 1 for the local video.
  this.activate_(this.localVideo_);
  // Transition opacity from 1 to 0 for the remote and mini videos.
  this.deactivate_(this.remoteVideo_);
  this.deactivate_(this.miniVideo_);
};

AppController.prototype.transitionToDone_ = function() {
  // Stop waiting for remote video.
  this.remoteVideo_.oncanplay = undefined;
  this.deactivate_(this.localVideo_);
  this.deactivate_(this.remoteVideo_);
  this.deactivate_(this.miniVideo_);
  this.hide_(this.hangupSvg_);
  this.activate_(this.rejoinDiv_);
  this.show_(this.rejoinDiv_);
  this.displayStatus_('');
};

AppController.prototype.onRejoinClick_ = function() {
  this.deactivate_(this.rejoinDiv_);
  this.hide_(this.rejoinDiv_);
  this.call_.restart();
};

AppController.prototype.onNewRoomClick_ = function() {
  this.deactivate_(this.rejoinDiv_);
  this.hide_(this.rejoinDiv_);
  this.showRoomSelection_();
};

// Spacebar, or m: toggle audio mute.
// c: toggle camera(video) mute.
// f: toggle fullscreen.
// i: toggle info panel.
// q: quit (hangup)
// Return false to screen out original Chrome shortcuts.
AppController.prototype.onKeyPress_ = function(event) {
  switch (String.fromCharCode(event.charCode)) {
    case ' ':
    case 'm':
      if (this.call_) {
        this.call_.toggleAudioMute();
        this.muteAudioIconSet_.toggle();
      }
      return false;
    case 'c':
      if (this.call_) {
        this.call_.toggleVideoMute();
        this.muteVideoIconSet_.toggle();
      }
      return false;
    case 'f':
      this.toggleFullScreen_();
      return false;
    case 'i':
      this.infoBox_.toggleInfoDiv();
      return false;
    case 'q':
      this.hangup_();
      return false;
    default:
      return;
  }
};



AppController.prototype.displayStatus_ = function(status) {

};

AppController.prototype.displayError_ = function(error) {
  trace(error);
  this.infoBox_.pushErrorMessage(error);
};

AppController.prototype.toggleAudioMute_ = function() {
  this.call_.toggleAudioMute();
  this.muteAudioIconSet_.toggle();
};

AppController.prototype.toggleVideoMute_ = function() {
  this.call_.toggleVideoMute();
  this.muteVideoIconSet_.toggle();
};

AppController.prototype.toggleFullScreen_ = function() {
  if (isFullScreen()) {
    trace('Exiting fullscreen.');
    document.querySelector('svg#fullscreen title').textContent =
        'Enter fullscreen';
    document.cancelFullScreen();
  } else {
    trace('Entering fullscreen.');
    document.querySelector('svg#fullscreen title').textContent =
        'Exit fullscreen';
    document.body.requestFullScreen();
  }
  this.fullscreenIconSet_.toggle();
};

AppController.prototype.hide_ = function(element) {
  element.classList.add('hidden');
};

AppController.prototype.show_ = function(element) {
  element.classList.remove('hidden');
};

AppController.prototype.activate_ = function(element) {
  element.classList.add('active');
};

AppController.prototype.deactivate_ = function(element) {
  element.classList.remove('active');
};

AppController.prototype.showIcons_ = function() {
  if (!this.icons_.classList.contains('active')) {
    this.activate_(this.icons_);
    this.setIconTimeout_();
  }
};

AppController.prototype.hideIcons_ = function() {
  if (this.icons_.classList.contains('active')) {
    this.deactivate_(this.icons_);
  }
};

AppController.prototype.setIconTimeout_ = function() {
  if (this.hideIconsAfterTimeout) {
    window.clearTimeout.bind(this, this.hideIconsAfterTimeout);
  }
  this.hideIconsAfterTimeout =
    window.setTimeout(function() {
    this.hideIcons_();
  }.bind(this), 5000);
};

AppController.prototype.iconEventSetup_ = function() {
  this.icons_.onmouseenter = function() {
    window.clearTimeout(this.hideIconsAfterTimeout);
  }.bind(this);

  this.icons_.onmouseleave = function() {
    this.setIconTimeout_();
  }.bind(this);
};

AppController.prototype.loadUrlParams_ = function() {
  /* jscs: disable */
  /* jshint ignore:start */
  // Suppressing jshint warns about using urlParams['KEY'] instead of
  // urlParams.KEY, since we'd like to use string literals to avoid the Closure
  // compiler renaming the properties.
  var DEFAULT_VIDEO_CODEC = 'VP9';
  var urlParams = queryStringToDictionary(window.location.search);
  this.loadingParams_.audioSendBitrate = urlParams['asbr'];
  this.loadingParams_.audioSendCodec = urlParams['asc'];
  this.loadingParams_.audioRecvBitrate = urlParams['arbr'];
  this.loadingParams_.audioRecvCodec = urlParams['arc'];
  this.loadingParams_.opusMaxPbr = urlParams['opusmaxpbr'];
  this.loadingParams_.opusFec = urlParams['opusfec'];
  this.loadingParams_.opusDtx = urlParams['opusdtx'];
  this.loadingParams_.opusStereo = urlParams['stereo'];
  this.loadingParams_.videoSendBitrate = urlParams['vsbr'];
  this.loadingParams_.videoSendInitialBitrate = urlParams['vsibr'];
  this.loadingParams_.videoSendCodec = urlParams['vsc'];
  this.loadingParams_.videoRecvBitrate = urlParams['vrbr'];
  this.loadingParams_.videoRecvCodec = urlParams['vrc'] || DEFAULT_VIDEO_CODEC;
  /* jshint ignore:end */
  /* jscs: enable */
};

AppController.IconSet_ = function(iconSelector) {
  this.iconElement = document.querySelector(iconSelector);
};

AppController.IconSet_.prototype.toggle = function() {
  if (this.iconElement.classList.contains('on')) {
    this.iconElement.classList.remove('on');
    // turn it off: CSS hides `svg path.on` and displays `svg path.off`
  } else {
    // turn it on: CSS displays `svg.on path.on` and hides `svg.on path.off`
    this.iconElement.classList.add('on');
  }
};
