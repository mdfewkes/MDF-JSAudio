const REMOVE = 0; // Arrayformat [REMOVE]
const FADE = 1; // Arrayformat [FADE, track, starttime, endtime, startvolume, endvolume]
const LOOP = 2; // Arrayformat [LOOP, track]

var date = new Date();

function musicEventManager() {
	var eventList = [];
	var now = date.now();

	this.update = function() {
		var now = date.now();
		runlist();
		cleanupList();
	}

	this.addFadeEvent = function(track, duration, startVol, endVol) {

	}

	this.addLoopEvent = function(track) {

	}

	function runList(){

	}

	function cleanupList() {

	}

	function checkListFor(){

	}
}