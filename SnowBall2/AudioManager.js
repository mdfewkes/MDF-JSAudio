//Time Manager
const REMOVE = 0; 	// Arrayformat [REMOVE]
const READY = 1; 	// Arrayformat [READY, clip, file]
const FADE = 2; 	// Arrayformat [FADE, clip, startTime, endTime, startVolume, endVolume, crossfade]
const TIMER = 3; 	// Arrayformat [TIMER, clip, endTime, callSign]
const PLAY = 4; 	// Arrayformat [PLAY, clip, endTime]
const STOP = 5; 	// Arrayformat [STOP, clip, endTime]

function audioEventManager() {
	var eventList = [];
	var now = window.performance.now();
	var paused = false;
	var pauseTime = 0;

	this.updateEvents = function() {
		now = window.performance.now();

		cleanupList();
		runList();
	}

	this.pause = function() {
		now = window.performance.now();
		pauseTime = now;
		paused = true;
	}

	this.unpause = function() {
		now = window.performance.now();
		let pauseDuration = now - pauseTime;

		for (let i = 0; i < eventList.length; i++) {
			if (eventList[i][0] >= TIMER) {
				eventList[i][2] += pauseDuration;
			} else if (eventList[i][0] == FADE) {
				eventList[i][2] += pauseDuration;
				eventList[i][3] += pauseDuration;
			}
		}

		paused = false;
	}

	this.addFadeEvent = function(clip, duration, endVolume) {
		// Arrayformat [FADE, clip, startTime, endTime, startVolume, endVolume, crossfade = false]
		let check = checkListFor(FADE, clip);
		let endTime = duration * 1000 + now;
		let startVolume = clip.getVolume();
		//console.log("Adding Fade Event for " + clip.name);

		if (check < 0) {
			eventList.push([FADE, clip, now, endTime, startVolume, endVolume, false]);
		} else {
			eventList[check] = [FADE, clip, now, endTime, startVolume, endVolume, false];
		}
	}

	this.addCrossfadeEvent = function(clip, duration, endVolume) {
		// Arrayformat [FADE, clip, startTime, endTime, startVolume, endVolume, crossfade = true]
		let check = checkListFor(FADE, clip);
		let endTime = duration * 1000 + now;
		let startVolume = clip.getVolume();
		//console.log("Adding Fade Event for " + clip.name);

		if (check < 0) {
			eventList.push([FADE, clip, now, endTime, startVolume, endVolume, true]);
		} else {
			eventList[check] = [FADE, clip, now, endTime, startVolume, endVolume, true];
		}
	}

	this.addTimerEvent = function(clip, duration, callSign = "none") {
		// Arrayformat [TIMER, clip, endTime, callSign]
		let thisClip = clip;
		let check = checkListFor(TIMER, thisClip, callSign);
		let endTime = (duration * 1000) + now;

		if (check < 0) {
			//console.log(duration + " Adding Timer Event for " + clip.name + ". CallSign: " + callSign);
			eventList.push([TIMER, clip, endTime, callSign]);
		} else {
			//console.log("Replacing Timer Event for " + clip.name + ". CallSign: " + callSign);
			eventList[check] = [TIMER, clip, endTime, callSign];
		}
	}

	this.addPlayEvent = function(clip, duration) {
		// Arrayformat [PLAY, clip, endTime]
		let thisClip = clip;
		let check = checkListFor(PLAY, thisClip);
		let endTime = (duration * 1000) + now;

		if (check < 0) {
			//console.log("Adding Play Event for " + clip.name);
			eventList.push([PLAY, clip, endTime]);
		} else {
			eventList[check] = [PLAY, clip, endTime];
		}
	}

	this.addPlayOnReadyEvent = function(clip) {
		// Arrayformat [READY, clip, file]
		let thisClip = clip;
		let check = checkListFor(READY, thisClip);
		let file = clip.getSourceClip().getAudioFile();

		if (check < 0) {
			//console.log("Adding PlayOnReady Event for " + clip.name);
			eventList.push([READY, clip, file]);
		} else {
			eventList[check] = [READY, clip, file];
		}
	}

	this.addStopEvent = function(clip, duration) {
		// Arrayformat [STOP, clip, endTime]
		let thisClip = clip;
		let check = checkListFor(STOP, thisClip);
		let endTime = (duration * 1000) + now;

		if (check < 0) {
			//console.log("Adding Stop Event for " + clip.name);
			eventList.push([STOP, clip, endTime]);
		} else {
			eventList[check] = [STOP, clip, endTime];
		}
	}

	this.removeTimerEvent = function(clip, callSign = "") {
		let thisClip = clip;
		if (callSign != "") {
			let check = checkListFor(TIMER, thisClip, callSign);
			if (check < 0) {
				return;
			} else {
				//console.log("Removing Timer Event for " + clip.name + ". CallSign: " + callSign);
				eventList[check] = [REMOVE];
			}
		} else {
			let check = checkListFor(TIMER, thisClip);
			while(check >= 0) {
			//console.log("Removing Timer Event for " + clip.name);
				eventList[check] = [REMOVE];
				check = checkListFor(TIMER, thisClip);
			}
		}
	}

	this.removePlayEvent = function(clip) {
		let thisClip = clip;
		let check = checkListFor(PLAY, thisClip);

		if (check < 0) {
			return;
		} else {
			//console.log("Removing PlayOnReady Event for " + clip.name);
			eventList[check] = [REMOVE];
		}
	}

	this.removePlayOnReadyEvent = function(clip) {
		let thisClip = clip;
		let check = checkListFor(READY, thisClip);

		if (check < 0) {
			return;
		} else {
			//console.log("Removing PlayOnReady Event for " + clip.name);
			eventList[check] = [REMOVE];
		}
	}

	this.removeStopEvent = function(clip) {
		let thisClip = clip;
		let check = checkListFor(STOP, thisClip);

		if (check < 0) {
			return;
		} else {
			//console.log("Removing Stop Event for " + clip.name);
			eventList[check] = [REMOVE];
		}
	}

	this.getEventSecondsRemaining = function(clip, eventType, callSign = "") {
		now = window.performance.now();
		let thisClip = clip;
		let check = checkListFor(eventType, thisClip, callSign);

		if (check < 0) {
			return 0;
		} else {
			return (eventList[check][2] - now)/1000;
		}
	}

	function runList(){
		if (paused) return;

		//console.log("Running list; " + eventList.length + " items.");

		for (let i = 0; i < eventList.length; i++) {
			let thisClip = eventList[i][1];

			if (eventList[i][0] == FADE) {
			// Arrayformat [FADE, clip, startTime, endTime, startVolume, endVolume, crossfade]
				if (now > eventList[i][3]) {
					//console.log("Ending Fade Event for " + thisClip.name);
					let endVolume = eventList[i][5];
					eventList[i] = [REMOVE];
					thisClip.setVolume(endVolume);
					continue;
				}

				let newVolume;
				if(eventList[i][6]) { //if crossfading
					if(eventList[i][4] < eventList[i][5]){ //if fading in
						newVolume = scaleRange(0, 1, eventList[i][4], eventList[i][5], 
							Math.pow(interpolateFade(eventList[i][2], eventList[i][3], 0, 1, now), 0.5));
					} else { //else fading out
						newVolume = scaleRange(1, 0, eventList[i][4], eventList[i][5], 
							Math.pow(interpolateFade(eventList[i][2], eventList[i][3], 1, 0, now), 0.5));
					}
				} else {
					newVolume = interpolateFade(eventList[i][2], eventList[i][3], eventList[i][4], eventList[i][5], now);
				}
				thisClip.setVolume(newVolume);

				continue;
			}

			if (eventList[i][0] == TIMER) {
			// Arrayformat [TIMER, clip, endTime, callSign]
				////console.log("Checking Timer Event for " + thisClip.name + ". CallSign is: " + eventList[i][3]);
				if (now >= eventList[i][2]) {
					let callSign = eventList[i][3];
					//console.log("Triggering Timer Event for " + thisClip.name + ". CallSign is: " + callSign);
					eventList[i][0] = [REMOVE];
					thisClip.trigger(callSign);
				}

				continue;
			}

			if (eventList[i][0] == PLAY) {
			//Arrayformat [PLAY, clip, endTime]
				if (now >= eventList[i][2]) {
					//console.log("Executing Play Event for " + thisClip.name);
					eventList[i] = [REMOVE];
					thisClip.play();
				}

				continue;
			}

			if (eventList[i][0] == READY) {
			//Arrayformat [READY, clip, file]
				if (eventList[i][2].readyState >= 4) {
					//console.log("Executing PlayOnReady Event for " + thisClip.name);
					eventList[i] = [REMOVE];
					thisClip.play();
				}

				continue;
			}

			if (eventList[i][0] == STOP) {
			//Arrayformat [STOP, clip, endTime]
				if (now >= eventList[i][2]) {
					//console.log("Executing Stop Event for " + thisClip.name);
					eventList[i] = [REMOVE];
					thisClip.stop();
				}

				continue;
			}
		}
	}

	function cleanupList() {
		//console.log("Cleaning up");
		if (paused) return;

		for (let i = eventList.length - 1; i >= 0; i--) {
			if (eventList[i][0] == REMOVE) {
				//console.log("Pop");
				eventList.splice(i, 1);
			}
		}
	}

	function checkListFor(eventType, clip, callSign = ""){
		for (let i = 0; i < eventList.length; i++) {
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
		return -1;
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
		let currentVolume = startVolume + (currentTime - startTime) * ((endVolume - startVolume) / (endTime - startTime));

		return currentVolume;
	}

	function scaleRange(inputStart, inputEnd, outputStart, outputEnd, value) {
		let scale = (outputEnd - outputStart) / (inputEnd - inputStart);
		return outputStart + ((value - inputStart) * scale);
	}
}

var AudioEventManager = new audioEventManager();