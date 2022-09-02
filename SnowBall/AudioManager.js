
function setFormat() {
	var audio = new Audio();
	if (audio.canPlayType("audio/ogg")) {
		audioFormatType = ".ogg";
	} else {
		audioFormatType = ".mp3";
	}
}

function setAudioPath(path = "") {
	audioPath = path;
}

function audioFormat(alt = false) {
	var format = audioFormatType;
	if (alt != false) {
		format = ".mp3";
	}
	return format;
}


function toggleMute() {
	for (i in volumeManagerList) {
		volumeManagerList[i].setMuted(!volumeManagerList[i].getMuted());
	}
}

function setMute(TorF) {
	for (i in volumeManagerList) {
		volumeManagerList[i].setMuted(TorF);
	}
}

function getMute() {
	//var isNotMuted = SFXVolumeManager.getMuted() * MusicVolumeManager.getMuted();
	var isNotMuted = 1;

	for (i in volumeManagerList) {
		isNotMuted *= volumeManagerList[i].getMuted();
	}

	return isNotMuted;
}


//Time Manager
const REMOVE = 0; // Arrayformat [REMOVE]
const FADE = 1; // Arrayformat [FADE, clip, startTime, endTime, startVolume, endVolume, crossfade]
const TIMER = 2; // Arrayformat [TIMER, clip, endTime, callSign]
const PLAY = 3; // Arrayformat [PLAY, clip, endTime]
const READY = 4; // Arrayformat [READY, clip, file]
const STOP = 5; // Arrayformat [STOP, clip, endTime]
const CALLBACK = 6; // Arrayformat [CALLBACK, callback, endTime]

var AudioEventManager = new audioEventManager();

function audioEventManager() {
	var eventList = [];
	var now = window.performance.now();

	this.returnEventList = function() {
		return eventList;
	}

	this.updateEvents = function() {
		now = window.performance.now();
		cleanupList();
		runList();
	}

	this.addFadeEvent = function(clip, duration, endVol) {
		// Arrayformat [FADE, clip, startTime, endTime, startVolume, endVolume, crossfade = false]
		var check = checkListFor(FADE, clip);
		var endTime = duration * 1000 + now;
		var startVolume = clip.getVolume();
		//console.log("Adding Fade Event for " + clip.name);

		if (check == "none") {
			eventList.push([FADE, clip, now, endTime, startVolume, endVol, false]);
		} else {
			eventList[check] = [FADE, clip, now, endTime, startVolume, endVol, false];
		}
	}

	this.addCrossfadeEvent = function(clip, duration, endVol) {
		// Arrayformat [FADE, clip, startTime, endTime, startVolume, endVolume, crossfade = true]
		var check = checkListFor(FADE, clip);
		var endTime = duration * 1000 + now;
		var startVolume = clip.getVolume();
		//console.log("Adding Fade Event for " + clip.name);

		if (check == "none") {
			eventList.push([FADE, clip, now, endTime, startVolume, endVol, true]);
		} else {
			eventList[check] = [FADE, clip, now, endTime, startVolume, endVol, true];
		}
	}

	this.addTimerEvent = function(clip, duration, callSign = "none") {
		// Arrayformat [TIMER, clip, endTime, callSign]
		var thisClip = clip;
		var check = checkListFor(TIMER, thisClip, callSign);
		var endTime = (duration * 1000) + now;

		if (check == "none") {
			//console.log("Adding Timer Event for " + clip.name + ". CallSign: " + callSign);
			eventList.push([TIMER, clip, endTime, callSign]);
		} else {
			//console.log("Replacing Timer Event for " + clip.name + ". CallSign: " + callSign);
			eventList[check] = [TIMER, clip, endTime, callSign];
		}
	}

	this.addPlayEvent = function(clip, duration) {
		// Arrayformat [PLAY, clip, endTime]
		var thisClip = clip;
		var check = checkListFor(PLAY, thisClip);
		var endTime = (duration * 1000) + now;

		if (check == "none") {
			//console.log("Adding Play Event for " + clip.name);
			eventList.push([PLAY, clip, endTime]);
		} else {
			eventList[check] = [PLAY, clip, endTime];
		}
	}

	this.addPlayOnReadyEvent = function(clip) {
		// Arrayformat [READY, clip, file]
		var thisClip = clip;
		var check = checkListFor(READY, thisClip);
		var file = clip.getSourceClip().getAudioFile();

		if (check == "none") {
			//console.log("Adding PlayOnReady Event for " + clip.name);
			eventList.push([READY, clip, file]);
		} else {
			eventList[check] = [READY, clip, file];
		}
	}

	this.addCallbackEvent = function(callback, duration) {
		// Arrayformat [CALLBACK, callback, endTime]
		var thisCallback = callback;
		var endTime = (duration * 1000) + now;

		//console.log("Adding Callback Event);
		eventList.push([CALLBACK, thisCallback, endTime]);
		return thisCallback;
	}

	this.addStopEvent = function(clip, duration) {
		// Arrayformat [STOP, clip, endTime]
		var thisClip = clip;
		var check = checkListFor(STOP, thisClip);
		var endTime = (duration * 1000) + now;

		if (check == "none") {
			//console.log("Adding Stop Event for " + clip.name);
			eventList.push([STOP, clip, endTime]);
		} else {
			eventList[check] = [STOP, clip, endTime];
		}
	}

	this.removeTimerEvent = function(clip, callSign = "") {
		var thisClip = clip;
		if(callSign != "") {
			var check = checkListFor(TIMER, thisClip, callSign);
			if (check == "none") {
				return;
			} else {
				//console.log("Removing Timer Event for " + clip.name + ". CallSign: " + callSign);
				eventList[check] = [REMOVE];
			}
		} else {
			var check = checkListFor(TIMER, thisClip);
			while(check != "none") {
			//console.log("Removing Timer Event for " + clip.name);
				eventList[check] = [REMOVE];
				check = checkListFor(TIMER, thisClip);
			}
		}
	}

	this.removePlayEvent = function(clip) {
		var thisClip = clip;
		var check = checkListFor(PLAY, thisClip);

		if (check == "none") {
			return;
		} else {
			//console.log("Removing PlayOnReady Event for " + clip.name);
			eventList[check] = [REMOVE];
		}
	}

	this.removePlayOnReadyEvent = function(clip) {
		var thisClip = clip;
		var check = checkListFor(READY, thisClip);

		if (check == "none") {
			return;
		} else {
			//console.log("Removing PlayOnReady Event for " + clip.name);
			eventList[check] = [REMOVE];
		}
	}

	this.removeStopEvent = function(clip) {
		var thisClip = clip;
		var check = checkListFor(STOP, thisClip);

		if (check == "none") {
			return;
		} else {
			//console.log("Removing Stop Event for " + clip.name);
			eventList[check] = [REMOVE];
		}
	}

	this.removeCallbackEvent = function(callback) {
		var thisCallback = callback;
		var check = checkListFor(CALLBACK, thisCallback);

		if (check == "none") {
			return;
		} else {
			//console.log("Removing Stop Event for " + clip.name);
			eventList[check] = [REMOVE];
		}
	}

	this.getEventSecondsRemaining = function(clip, eventType, callSign = "") {
		now = window.performance.now();
		var thisClip = clip;
		var check = checkListFor(eventType, thisClip, callSign);

		if (check == "none") {
			return "none";
		} else {
			return (eventList[check][2] - now)/1000;
		}
	}

	function runList(){
		for (var i = 0; i < eventList.length; i++) {
			var thisClip = eventList[i][1];

			if (eventList[i][0] == FADE) {
			// Arrayformat [FADE, clip, startTime, endTime, startVolume, endVolume, crossfade]
				if(eventList[i][6]) {
					if(eventList[i][4] < eventList[i][5]){
						thisClip.setVolume(scaleRange(0, 1, eventList[i][4], eventList[i][5], 
							Math.pow(interpolateFade(eventList[i][2], eventList[i][3], 0, 1, now), 0.5)));
					} else {
						thisClip.setVolume(scaleRange(1, 0, eventList[i][4], eventList[i][5], 
							Math.pow(interpolateFade(eventList[i][2], eventList[i][3], 1, 0, now), 0.5)));
					}
				} else {
					thisClip.setVolume(interpolateFade(eventList[i][2], eventList[i][3], eventList[i][4], eventList[i][5], now));
				}
				if (now > eventList[i][3]) {
					//console.log("Ending Fade Event for " + thisClip.name);
					thisClip.setVolume(eventList[i][5]);
					eventList[i] = [REMOVE];
				}
			}

			if (eventList[i][0] == TIMER) {
			// Arrayformat [TIMER, clip, endTime, callSign]
				if (now >= eventList[i][2]) {
					var callSign = eventList[i][3];
					//console.log("Triggering Timer Event for " + thisClip.name + ". CallSign is: " + eventList[i][3]);
					eventList[i] = [REMOVE];
					thisClip.trigger(callSign);
				}
			}

			if (eventList[i][0] == PLAY) {
			//Arrayformat [PLAY, clip, endTime]
				if (now >= eventList[i][2]) {
					//console.log("Executing Play Event for " + thisClip.name);
					thisClip.play();
					eventList[i] = [REMOVE];
				}
			}

			if (eventList[i][0] == READY) {
			//Arrayformat [REAADY, clip, file]
				if (eventList[i][2].readyState >= 4) {
					//console.log("Executing PlayOnReady Event for " + thisClip.name);
					thisClip.play();
					eventList[i] = [REMOVE];
				}
			}

			if (eventList[i][0] == STOP) {
			//Arrayformat [STOP, clip, endTime]
				if (now >= eventList[i][2]) {
					//console.log("Executing Stop Event for " + thisClip.name);
					thisClip.stop();
					eventList[i] = [REMOVE];
				}
			}

			if (eventList[i][0] == CALLBACK) {
			// Arrayformat [CALLBACK, callback, endTime]
				if (now >= eventList[i][2]) {
					//console.log("Executing Callback");
					eventList[i][1]();
					eventList[i] = [REMOVE];
				}
			}
		}
	}

	function cleanupList() {
		//console.log("Cleaning up");
		eventList.sort(function(a, b){return b[0]-a[0]});
		while (eventList[eventList.length - 1] == REMOVE) {
			//console.log("Removing Event");
			eventList.pop();
		}
	}

	function checkListFor(eventType, clip, callSign = ""){
		var foundItem = false;
		for (var i = 0; i < eventList.length; i++) {
			if (eventList[i][0] == eventType) {
				if (eventList[i][1] == clip) {
					if (eventType != TIMER) {
						return i;
					} else if (callSign == "") {
						return i;
					} else if (eventList[i][3] == callSign) {
						return i;
					}
				}
			}
		}
		return "none";
	}

	function interpolateFade(startTime, endTime, startVolume, endVolume, currentTime) {
		/*
		x1 = startTime
		y1 = startVolume		
	
		x2 = endTime
		y2 = endVolume		

		x = currentTime
		y = y1 + (x - x1)((y2 - y1)/(x2 - x1))

   		currentVolume = startVolume + (currentTime - startTime) * ((endVolume - startVolume) / (endTime - startTime))
		*/
		if (currentTime > endTime) {currentTime = endTime;}
		var currentVolume = startVolume + (currentTime - startTime) * ((endVolume - startVolume) / (endTime - startTime));

		return currentVolume;
	}

	function scaleRange(inputStart, inputEnd, outputStart, outputEnd, value) {
		var scale = (outputEnd - outputStart) / (inputEnd - inputStart);
		return outputStart + ((value - inputStart) * scale);
	}
}