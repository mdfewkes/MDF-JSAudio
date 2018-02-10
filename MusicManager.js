const REMOVE = 0; // Arrayformat [REMOVE]
const FADE = 1; // Arrayformat [FADE, track, starttime, endtime, startvolume, endvolume]
const LOOP = 2; // Arrayformat [LOOP, track, endtime]

var date = new Date();

function musicEventManager() {
	var eventList = [];
	var now = date.now();

	this.update = function() {
		var now = date.now();
		runlist();
		cleanupList();
	}

	this.addFadeEvent = function(track, duration, endVol) {
	var check = checkListFor(FADE, track);
	var endTime = duration * 1000 + now;
	var startvolume = track.getVolume();

		if (check == "none") {
			eventList.push([FADE, track, now, endTime, startVolume, endVol]);
		} else {
			eventList[check]] = [FADE, track, now, endTime, startVolume, endVol];
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
	}

	function runList(){
		for (var i in eventList) {
			if (eventList[i][0] == FADE) {

			}
			if (eventList[i][0] == LOOP) {
				if (!eventList[i][1].getPaused()) {
					if (eventList[i][2] < now) {
						eventList[i][1].triggerLoop();
						eventList[i][2] = eventList[i][1].getDuration() * 1000 + now;
					}
				} else {eventList[i] = [REMOVE];}
			}
		}

	}

	function cleanupList() {
		eventList.sort(function(a, b){return b-a};
		while (eventList[eventList.length - 1] == REMOVE) {
			eventList.pop();
		}
	}

	function checkListFor(eventType, track){
		for (var i in eventList) {
			if (eventList[i][0] == eventType) {
				if (eventList[i][1] == track) {
					return i;
				}
			}
		}
		return "none";
	}
}