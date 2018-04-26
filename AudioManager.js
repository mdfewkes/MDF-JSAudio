setFormat();
setAudioPath("Audio/");

//set sound clips and music tracks here
var track1 = new musicTrackOverlapLooping("lay4tail16", 16);
var track2 = new musicTrackOverlapLooping("lay2tail8", 8);
var track3 = new musicTrackOverlapLooping("LayTail34", 8);
var backgroundTracks = new musicContainerCrossfade([track1, track2, track3]);
var layer1 = new musicTrackOverlapLooping("clavtail2", 2);
var layer2 = new musicTrackOverlapLooping("cabasatail2", 2);
var layer3 = new musicTrackOverlapLooping("kicktail2", 2);
var backgroundLayers = new musicContainerLayers([layer1, layer2, layer3]);
var backgroundMusic = new musicContainerCrossfade([backgroundTracks, backgroundLayers]);

var controles = new sfxClipSpriteSheet("controls", [[0.242,0.578],[1.326,1.82],[2.6,2.95]]);
var conPlay = new sfxClipSprite(controles, 0);
var conPause = new sfxClipSprite(controles, 1);
var conStop = new sfxClipSprite(controles, 2);

track1.setTrackName("track1");
track2.setTrackName("track2");
track3.setTrackName("track3");
track2.setMixVolume(0.85);
track3.setMixVolume(0.75);

layer1.setTrackName("layer1");
layer2.setTrackName("layer2");
layer3.setTrackName("layer3");


controles.setMixVolume(0.75);



var test1 = new musicTrackOverlap("clavtail2", 2);
var test2 = new musicTrackOverlap("cabasatail2", 2);

var testC = new musicContainerSequenceLoopLast([test1,test2]);





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
	isMuted = !isMuted;
	SFXVolumeManager.updateVolume();
	MusicVolumeManager.updateVolume();
}

function setMute(TorF) {
	isMuted = TorF;
	SFXVolumeManager.updateVolume();
	MusicVolumeManager.updateVolume();
}

function getMute(TorF) {
	return isMuted;
	SFXVolumeManager.updateVolume();
	MusicVolumeManager.updateVolume();
}



//Time Manager
const REMOVE = 0; // Arrayformat [REMOVE]
const FADE = 1; // Arrayformat [FADE, track, startTime, endTime, startVolume, endVolume, crossfade]
const TIMER = 2; // Arrayformat [TIMER, track, endTime, callSign]
const STOP = 3; // Arrayformat [STOP, track, endTime]

var AudioEventManager = new audioEventManager();

function audioEventManager() {
	var eventList = [];
	var now = Date.now();

	this.returnEventList = function() {
		return eventList;
	}

	this.updateEvents = function() {
		now = Date.now();
		cleanupList();
		runList();
	}

	this.addFadeEvent = function(track, duration, endVol) {
		// Arrayformat [FADE, track, startTime, endTime, startVolume, endVolume, crossfade = false]
		var check = checkListFor(FADE, track);
		var endTime = duration * 1000 + now;
		var startVolume = track.getVolume();
		//console.log("Adding Fade Event for " + track.getTrackName());

		if (check == "none") {
			eventList.push([FADE, track, now, endTime, startVolume, endVol, false]);
		} else {
			eventList[check] = [FADE, track, now, endTime, startVolume, endVol, false];
		}
	}

	this.addCrossfadeEvent = function(track, duration, endVol) {
		// Arrayformat [FADE, track, startTime, endTime, startVolume, endVolume, crossfade = true]
		var check = checkListFor(FADE, track);
		var endTime = duration * 1000 + now;
		var startVolume = track.getVolume();
		//console.log("Adding Fade Event for " + track.getTrackName());

		if (check == "none") {
			eventList.push([FADE, track, now, endTime, startVolume, endVol, true]);
		} else {
			eventList[check] = [FADE, track, now, endTime, startVolume, endVol, true];
		}
	}

	this.addTimerEvent = function(track, duration, callSign = "none") {
		// Arrayformat [TIMER, track, endTime, callSign]
		var thisTrack = track;
		var check = checkListFor(TIMER, thisTrack, callSign);
		var endTime = (duration * 1000) + now;

		if (check == "none") {
			//console.log("Adding Timer Event for " + track.getTrackName() + ". CallSign: " + callSign);
			eventList.push([TIMER, track, endTime, callSign]);
		} else {
			//console.log("Replacing Timer Event for " + track.getTrackName() + ". CallSign: " + callSign);
			eventList[check] = [TIMER, track, endTime, callSign];
		}
	}

	this.addStopEvent = function(track, duration) {
		// Arrayformat [STOP, track, endTime]
		var thisTrack = track;
		var check = checkListFor(STOP, thisTrack);
		var endTime = (duration * 1000) + now;
		//var endTime = (thisTrack.getDuration() - thisTrack.getTime()) * 1000 + now;

		if (check == "none") {
			//console.log("Adding Stop Event for " + track.getTrackName());
			eventList.push([STOP, track, endTime]);
		} else {
			eventList[check] = [STOP, track, endTime];
		}
	}

	this.removeTimerEvent = function(track, callSign = "none") {
		var thisTrack = track;
		var check = checkListFor(TIMER, thisTrack, callSign);

		if (check == "none") {
			return;
		} else {
			//console.log("Removing Timer Event for " + track.getTrackName() + ". CallSign: " + callSign);
			eventList[check] = [REMOVE];
		}
	}

	this.removeStopEvent = function(track) {
		var thisTrack = track;
		var check = checkListFor(STOP, thisTrack);

		if (check == "none") {
			return;
		} else {
			//console.log("Removing Stop Event for " + track.getTrackName());
			eventList[check] = [REMOVE];
		}
	}

	function runList(){
		for (var i = 0; i < eventList.length; i++) {
			if (eventList[i][0] == FADE) {
				// Arrayformat [FADE, track, startTime, endTime, startVolume, endVolume, crossfade]
				thisTrack = eventList[i][1];
				if (thisTrack.getPaused() == false) {
						if(eventList[i][6]) {
							if(eventList[i][4] < eventList[i][5]){
								thisTrack.setVolume(scaleRange(0, 1, eventList[i][4], eventList[i][5], 
									Math.pow(interpolateFade(eventList[i][2], eventList[i][3], 0, 1, now), 0.5)));
							} else {
								thisTrack.setVolume(scaleRange(1, 0, eventList[i][4], eventList[i][5], 
									Math.pow(interpolateFade(eventList[i][2], eventList[i][3], 1, 0, now), 0.5)));
							}
						} else {
							thisTrack.setVolume(interpolateFade(eventList[i][2], eventList[i][3], eventList[i][4], eventList[i][5], now));
						}
					if (eventList[i][3] < now) {
						//console.log("Ending Fade Event for " + thisTrack.getTrackName());
						eventList[i] = [REMOVE];
					}
				}
			}
			if (eventList[i][0] == TIMER) {
				// Arrayformat [TIMER, track, endTime, callSign]
				thisTrack = eventList[i][1];
				if (thisTrack.getPaused() == false) {
					if (eventList[i][2] <= now) {
						var callSign = eventList[i][3];
						//console.log("Triggering Timer Event. CallSign is: " + eventList[i][3]);
						eventList[i] = [REMOVE];
						thisTrack.trigger(callSign);
					}
				} else {
					//console.log("Track paused, removing Timer Event. CallSign is: " + eventList[i][3]);
					eventList[i] = [REMOVE];
				}
			}
			if (eventList[i][0] == STOP) {
				//Arrayformat [STOP, track, endTime]
				thisTrack = eventList[i][1];
				if (thisTrack.getPaused() == false) {
					if (eventList[i][2] <= now) {
						//console.log("Executing Stop Event for " + thisTrack.getTrackName());
						thisTrack.stop();
						eventList[i] = [REMOVE];
					}
				}
			}
		}

	}

	function cleanupList() {
		//console.log("Cleaning up");
		eventList.sort(function(a, b){return b-a});
		while (eventList[eventList.length - 1] == REMOVE) {
			//console.log("Removing Event");
			eventList.pop();
		}
	}

	function checkListFor(eventType, track, callSign = "none"){
		var foundItem = false;
		for (var i = 0; i < eventList.length; i++) {
			if (eventList[i][0] == eventType) {
				if (eventList[i][1] == track) {
					if(eventType == TIMER && eventList[i][3] == callSign) {
						foundItem = true;
						return i;
					} else if (eventType != TIMER) {
						foundItem = true;
						return i;
					}
				}
			}
		}
		if (!foundItem) {
			return "none";
		}
	}

	function interpolateFade(startTime, endTime, startVolume, endVolume, currentTime) {
		/*
		x1 = startTime
		y1 = startVolume		
	
		x2 = endTime
		y2 = endVolume		

		x = currentTime
		y = y1 + (x - x1)((y2 - y1)/(x2 - x1))
   	 currentVolume = startVolume + (now - startTime) * ((endVolume - startVolume) / (endTime - startTime))
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