setFormat();
isMuted = false;

//set sound clips and music tracks here
var track1 = new musicTrackLoopingWTail("Audio/lay4tail16", 16);
var track2 = new musicTrackLoopingWTail("Audio/lay2tail8", 8);
var track3 = new musicTrackLoopingWTail("Audio/LayTail34", 8);
var backgroundMusic = new musicContainerCrossfade([track1, track2, track3]);
var layer1 = new musicTrackLoopingWTail("Audio/clavtail2", 2);
var layer2 = new musicTrackLoopingWTail("Audio/cabasatail2", 2);
var layer3 = new musicTrackLoopingWTail("Audio/kicktail2", 2);
var backgroundPerc = new musicContainerLayers([layer1, layer2, layer3]);

//var clip1 = new sfxClipOverlap("Audio/Death", 3);

track1.setTrackName("track1");
track2.setTrackName("track2");
track3.setTrackName("track3");
track2.setMixVolume(0.85);
track3.setMixVolume(0.75);

layer1.setTrackName("layer1");
layer2.setTrackName("layer2");
layer3.setTrackName("layer3");




function setFormat() {
	var audio = new Audio();
	if (audio.canPlayType("audio/ogg")) {
		audioFormat = ".ogg";
	} else {
		audioFormat = ".mp3";
	}
}

function toggleMute() {
	isMuted = !isMuted;
}

function setMute(TorF) {
	isMuted = TorF;
}

function getMute(TorF) {
	return isMuted;
}



//Time Manager
const REMOVE = 0; // Arrayformat [REMOVE]
const FADE = 1; // Arrayformat [FADE, track, startTime, endTime, startVolume, endVolume]
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
		runList();
		cleanupList();
	}

	this.addFadeEvent = function(track, duration, endVol) {
		var check = checkListFor(FADE, track);
		var endTime = duration * 1000 + now;
		var startVolume = track.getVolume();
		//console.log("Adding Fade Event for " + track.getTrackName());

		if (check == "none") {
			eventList.push([FADE, track, now, endTime, startVolume, endVol]);
		} else {
			eventList[check] = [FADE, track, now, endTime, startVolume, endVol];
		}
	}

	this.addTimerEvent = function(track, callSign = "none") {
		var thisTrack = track;
		var check = checkListFor(TIMER, thisTrack, callSign);
		var endTime = (thisTrack.getDuration() - thisTrack.getTime()) * 1000 + now;

		if (check == "none") {
			//console.log("Adding Timer Event for " + track.getTrackName());
			eventList.push([TIMER, track, endTime, callSign]);
		} else {
			eventList[check] = [TIMER, track, endTime, callSign];
		}
	}

	this.addStopEvent = function(track) {
		var thisTrack = track;
		var check = checkListFor(STOP, thisTrack);
		var endTime = (thisTrack.getDuration() - thisTrack.getTime()) * 1000 + now;

		if (check == "none") {
			//console.log("Adding Stop Event for " + track.getTrackName());
			eventList.push([STOP, track, endTime]);
		} else {
			eventList[check] = [STOP, track, endTime];
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
				thisTrack = eventList[i][1];
				if (thisTrack.getPaused() == false) {
						thisTrack.setVolume(interpolateFade(eventList[i][2], eventList[i][3], eventList[i][4], eventList[i][5], now));
					if (eventList[i][3] < now) {
						//console.log("Ending Fade Event for " + thisTrack.getTrackName());
						eventList[i] = [REMOVE];
					}
				}
			}
			if (eventList[i][0] == TIMER) {
				thisTrack = eventList[i][1];
				if (thisTrack.getPaused() == false) {
					if (eventList[i][2] <= now) {
						//console.log("Ending Timer Event for " + thisTrack.getTrackName());
						eventList[i] = [REMOVE];
						thisTrack.triggerTimerEnded(eventList[i][3]);
					}
				} else {
					eventList[i] = [REMOVE];
				}
			}
			if (eventList[i][0] == STOP) {
				thisTrack = eventList[i][1];
				if (thisTrack.getPaused() == false) {
					if (eventList[i][2] <= now) {
						//console.log("Executing Stop Event for " + thisTrack.getTrackName());
						eventList[i] = [REMOVE];
						thisTrack.stop();
					}
				}
			}
		}

	}

	function cleanupList() {
		eventList.sort(function(a, b){return b-a});
		while (eventList[eventList.length - 1] == REMOVE) {
			eventList.pop();
		}
	}

	function checkListFor(eventType, track, callSign = ""){
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
}

function interpolateFade(startTime, endTime, startVolume, endVolume, currentTime) {
	/*
	x1 = startTime
	x2 = endTime

	y1 = startVolume
	y2 = endVolume

	x = now
	y = y1 + (x - x1)((y2 - y1)/(x2 - x1))
    output = startVolume + (now - startTime) * ((endVolume - startVolume) / (endTime - startTime))
	*/
	if (currentTime > endTime) {currentTime = endTime;}
	var output = startVolume + (currentTime - startTime) * ((endVolume - startVolume) / (endTime - startTime));

	return output;
}
