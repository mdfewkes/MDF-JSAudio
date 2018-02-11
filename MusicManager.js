const REMOVE = 0; // Arrayformat [REMOVE]
const FADE = 1; // Arrayformat [FADE, track, startTime, endTime, startVolume, endVolume]
const LOOP = 2; // Arrayformat [LOOP, track, endTime]
const STOP = 3; // Arrayformat [LOOP, track, endTime]

var musicManager = new musicEventManager();

function musicEventManager() {
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

		if (check == "none") {
			eventList.push([FADE, track, now, endTime, startVolume, endVol]);
		} else {
			eventList[check] = [FADE, track, now, endTime, startVolume, endVol];
		}
	}

	this.addLoopEvent = function(track) {
		thisTrack = track;
		var check = checkListFor(LOOP, thisTrack);
		var endTime = (thisTrack.getDuration() - thisTrack.getTime()) * 1000 + now;

		if (check == "none") {
			eventList.push([LOOP, track, endTime]);
		} else {
			eventList[check] = [LOOP, track, endTime];
		}
	}
	this.addStopEvent = function(track) {
		thisTrack = track;
		var check = checkListFor(STOP, thisTrack);
		var endTime = (thisTrack.getDuration() - thisTrack.getTime()) * 1000 + now;

		if (check == "none") {
			eventList.push([STOP, track, endTime]);
		} else {
			eventList[check] = [STOP, track, endTime];
		}
	}

	function runList(){
		for (var i = 0; i < eventList.length; i++) {
			if (eventList[i][0] == FADE) {
				thisTrack = eventList[i][1];
				if (thisTrack.getPaused() == false) {
						thisTrack.setVolume(interpolateFade(eventList[i][2], eventList[i][3], eventList[i][4], eventList[i][5], now));
					if (eventList[i][3] < now) {
						eventList[i] = [REMOVE];
					}
				}
			}
			if (eventList[i][0] == LOOP) {
				thisTrack = eventList[i][1];
				if (thisTrack.getPaused() == false) {
					if (eventList[i][2] <= now) {
						eventList[i] = [REMOVE];
						thisTrack.triggerLoopEnded();
					}
				} else {
					eventList[i] = [REMOVE];
				}
			}
			if (eventList[i][0] == STOP) {
				thisTrack = eventList[i][1];
				if (thisTrack.getPaused() == false) {
					if (eventList[i][2] <= now) {
						thisTrack.stop();
						eventList[i] = [REMOVE];
					}
				}
			}
		}

	}

	function cleanupList() {
		//console.log("Sorting List");
		eventList.sort(function(a, b){return b-a});
		while (eventList[eventList.length - 1] == REMOVE) {
			eventList.pop();
		}
	}

	function checkListFor(eventType, track){
		var foundItem = false;
		for (var i = 0; i < eventList.length; i++) {
			if (eventList[i][0] == eventType) {
				if (eventList[i][1] == track) {
					foundItem = true;
					return i;
				}
			}
		}
		if (!foundItem) {
			return "none";
		}
	}
}

function interpolateFade(startTime, endTime, startVolume, endVolume, now) {
	var finish = endTime - startTime;
	var currentTime = endTime - now;
	var offset = Math.min(startVolume, endVolume);
	var scale = Math.max(startVolume, endVolume) - offset;
	var output = startVolume;

	if (startVolume >= endVolume) {
		output = (startVolume - offset - (1 -currentTime/finish)) * scale + offset;
	} else {
		output = Math.abs(startVolume - offset - (1 -currentTime/finish)) * scale + offset;
	}
	return output;
}