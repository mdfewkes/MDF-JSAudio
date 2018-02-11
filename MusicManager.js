const REMOVE = 0; // Arrayformat [REMOVE]
const FADE = 1; // Arrayformat [FADE, track, starttime, endtime, startvolume, endvolume]
const LOOP = 2; // Arrayformat [LOOP, track, endtime]

var date = new Date();

var musicManager = new musicEventManager();

function musicEventManager() {
	var eventList = [];
	var now = date.now;

	this.returnEventList = function() {
		return eventList;
	}

	this.updateEvents = function() {
		console.log("update music manager");
		var now = date.now;
		runList();
		cleanupList();
	}

	this.addFadeEvent = function(track, duration, endVol) {
		var check = checkListFor(FADE, track);
		var endTime = duration * 1000 + now;
		var startvolume = track.getVolume();

		if (check == "none") {
			eventList.push([FADE, track, now, endTime, startVolume, endVol]);
		} else {
			eventList[check] = [FADE, track, now, endTime, startVolume, endVol];
		}
	}

	this.addLoopEvent = function(track) {
		var check = checkListFor(LOOP, track);
		var endTime = (track.getDuration() - track.getTime()) * 1000 + now;

		if (check == "none") {
			eventList.push([LOOP, track, endTime]);
		} else {
			eventList[check] = [LOOP, track, endTime];
		}
		console.log("Added loop event for " + track.getTrackName());
	}

	function runList(){
		console.log("running list");
		for (var i = 0; i < eventList.length; i++) {
			console.log("looping run list");
			console.log("investigating " + eventList[i][1]);
			if (eventList[i][0] == FADE) {

			}
			if (eventList[i][0] == LOOP) {
				thisTrack = eventList[i][1];
				console.log("found loop event for " + thisTrack);
				if (thisTrack.getPaused() == false) {
					console.log(thisTrack.getTrackName() + " is Playing");
					if (eventList[i][2] > now) {
						eventList[i] = [REMOVE];
						thisTrack.triggerLoopEnded();
					}
				} else {eventList[i] = [REMOVE];}
			}
		}

	}

	function cleanupList() {
		eventList.sort(function(a, b){return b-a});
		while (eventList[eventList.length - 1] == REMOVE) {
			eventList.pop();
		}
	}

	function checkListFor(eventType, track){
		for (var i = 0; i < eventList.length; i++) {
			if (eventList[i][0] == eventType) {
				if (eventList[i][1] == track) {
					return i;
				}
			}
		}
		return "none";
	}
}