const REMOVE = 0; // Arrayformat [REMOVE]
const FADE = 1; // Arrayformat [FADE, track, starttime, endtime, startvolume, endvolume]
const LOOP = 2; // Arrayformat [LOOP, track, endtime]

var musicManager = new musicEventManager();

function musicEventManager() {
	var eventList = [];
	var now = Date.now();

	this.returnEventList = function() {
		return eventList;
	}

	this.updateEvents = function() {
		now = Date.now();
		//console.log("updating music manager at " + now);
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
		//console.log("Adding loop event for " + track.getTrackName());
		thisTrack = track;
		var check = checkListFor(LOOP, thisTrack);
		var endTime = (thisTrack.getDuration() - thisTrack.getTime()) * 1000 + now;

		if (check == "none") {
			eventList.push([LOOP, track, endTime]);
			//console.log("Added loop event for " + track.getTrackName());
			//console.log("Endtime is " + endTime);
		} else {
			eventList[check] = [LOOP, track, endTime];
			//console.log("Updated loop event for " + track.getTrackName());
			//console.log("Endtime is " + endTime);
		}
	}

	function runList(){
		//console.log("running list");
		for (var i = 0; i < eventList.length; i++) {
			//console.log("looping run list");
			if (eventList[i][0] == FADE) {
				thisTrack = eventList[i][1];
				//console.log("found fade event for " + thisTrack.getTrackName());
				if (thisTrack.getPaused() == false) {
					//console.log(thisTrack.getTrackName() + " is Playing");

					if (eventList[i][2] < now) {
						eventList[i] = [REMOVE];
					}
				}
			}
			if (eventList[i][0] == LOOP) {
				thisTrack = eventList[i][1];
				//console.log("found loop event for " + thisTrack.getTrackName());
				if (thisTrack.getPaused() == false) {
					//console.log(thisTrack.getTrackName() + " is Playing");
					if (eventList[i][2] <= now) {
						eventList[i] = [REMOVE];
						//console.log("removing loop event for " + thisTrack.getTrackName());
						thisTrack.triggerLoopEnded();
					}
				} else {
					eventList[i] = [REMOVE];
					//console.log("removing loop event for " + thisTrack.getTrackName() + "(Not playing)");
				}
			}
		}

	}

	function cleanupList() {
		//console.log("Sorting List");
		eventList.sort(function(a, b){return b-a});
		while (eventList[eventList.length - 1] == REMOVE) {
			eventList.pop();
			//console.log("removing passed event");
		}
	}

	function checkListFor(eventType, track){
		//console.log("Checking for " + thisTrack.getTrackName() + " events");
		var foundItem = false;
		for (var i = 0; i < eventList.length; i++) {
			if (eventList[i][0] == eventType) {
				if (eventList[i][1] == track) {
					foundItem = true;
					//console.log("Found " + thisTrack.getTrackName() + " event");
					return i;
				}
			}
		}
		if (!foundItem) {
			//console.log("Found no " + thisTrack.getTrackName() + " event");
			return "none";
		}
	}
}