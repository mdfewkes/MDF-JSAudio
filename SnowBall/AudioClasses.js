// TODO:
// - calculate scheduled clip? would that simplify?

const VOLUME_FLOOR = 0.001;

var audioPath = "";
function setAudioPath(path = "") { audioPath = path; }

class volumeManager {
	constructor() {
		this._list = [];
		this._volume = 1;
		this._volumeMult = 1;
		this._muted = false;
		this._paused = false;
		this._resumeList = [];
	}

	updateVolume() {
		for(let i in this._list) {
			this._list[i].updateVolume();
		}
	}

	setVolume(amount) {
		this._volume = amount;
		for (let i in this._list) {
			this._list[i].updateVolume();
		}
	}

	getVolume() {
		return this._volume;
	}

	setMuted(ToF) {
		this._muted = ToF;
		this.updateVolume();
	}

	getMuted() {
		return this._muted;
	}

	addToList(item) {
		this._list.push(item);
		this._resumeList.push(item.getPlaying() && this.getPaused());
	}

	removeFromList(item) {
		let index = this._list.indexOf(item);
		if (index < 0) return;

		this._list.splice(index, 1);
		this._resumeList.splice(index, 1);
	}

	pause() {
		if (this.getPaused()) return;

		for(var i in this._list) {
			this._resumeList[i] = this._list[i].getPlaying();
			this._list[i].pause();
		}
		this._paused = true
	}

	unpause() {
		if (!this.getPaused()) return;

		for(var i in this._list) {
			if (this._resumeList[i] == true) this._list[i].resume();
		}
		this._paused = false;
	}

	updateItemOnResumeList(item) {
		if (!this.getPaused()) return;

		let index = this._list.indexOf(item);
		if (index < 0) return;

		this._resumeList[index] = this._list[index].getPlaying();
	}

	getPaused() {
		return this._paused;
	}
}
var MasterVolumeManager = new volumeManager();

class basePlayable {
	constructor() {
		this.name = "playbase";
		this._volume = 1;
		this._duration = 0;
		this._tick = 0;
	}

	play() {}
	stop() {}
	resume() {}
	pause() {}

	trigger(callSign) {
		if(callSign == "tick") {
			//console.log(this.name + " tick");
			this._tick++;
		}
	}

	updateVolume() {}
	setVolume(newVolume) {
		if (newVolume > 1) {newVolume = 1;}
		if (newVolume < 0) {newVolume = 0;}
		this._volume = newVolume;

		this.updateVolume();
	}
	getVolume() { 
		return this._volume; 
	}

	setTime(time) {}
	getTime() { 
		return 0; 
	}

	resetTick() { 
		this.tick = 0; 
	}
	getTick() { 
		return this._tick; 
	}

	getDuration() { 
		return this._duration; 
	}
	
	getPlaying() { 
		return false; 
	}

	getSourceClip() {
		return this;
	}

	getAudioFile() {
		return new Audio();
	}
}

class silence extends basePlayable {
	constructor(playLength) {
		super();

		this.name = "silence";

		this._duration = playLength;
		this._pauseTimestamp = 0;
		this._playing = false;
	}

	play() {
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
		this._playing = true;
		this._pauseTimestamp = 0;
	}

	stop() {
		AudioEventManager.removeTimerEvent(this);
		this._pauseTimestamp = 0;
		this._playing = false;
	}

	resume() {
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this._pauseTimestamp), "tick");
		this._playing = true;
	}

	pause() {
		this._pauseTimestamp = this.getTime();
		AudioEventManager.removeTimerEvent(this);
		this._playing = false;
	}

	setTime(time) {
		if (this.getPlaying()) {
			let newTime = this.getDuration() - time;
			AudioEventManager.addTimerEvent(this, newTime, "tick");
		} else {
			this._pauseTimestamp = time % this.getDuration();
		}
	}

	getTime() {
		if (this.getPlaying()) {
			return this.getDuration() - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		}

		return 0;
	}
	
	getPlaying() { 
		return this._playing;
	}
}

class clip extends basePlayable {
	constructor(filename) {
		super();

		this.name = filename;

		this._audioFile = new Audio(audioPath+filename);
		this._audioFile.snowballReferance = this;
		this._audioFile.onloadedmetadata = function() {
			this.snowballReferance._duration = this.duration;
		}

		this._mixVolume = 1;
		this._playing = false;
		this._virtual = false;

		this._audioFile.pause();

		this._vMan = MasterVolumeManager;
		this._vMan.addToList(this);
	}

	play() {
		this._audioFile.currentTime = 0;
		this.resume();
	}

	stop() {
		this._playing = false;
		this.pause();
		this._audioFile.currentTime = 0;
	}

	resume() {
		this.updateVolume();
		if (this.getVolume() > VOLUME_FLOOR) {
			this._audioFile.play();
		} else {
			this._virtual = true;
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		this._playing = true;
	}

	pause() {
		if (this._playing && this._virtual) {
			this._audioFile.currentTime = this.getDuration() - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {
			this._audioFile.pause();
		}
		AudioEventManager.removeTimerEvent(this);
		this._playing = false;
		this._virtual = false;
	}

	trigger(callSign) {
		if(callSign == "tick") {
			this._tick++;
			this._playing = false;
			this._virtual = false;
		}
	}

	updateVolume() {
		let newVolume = this.getVolume() * this._mixVolume * this._vMan.getVolume();
		newVolume = newVolume*newVolume;
		if (newVolume > 1) {newVolume = 1;}
		if (newVolume < 0) {newVolume = 0;}

		this._audioFile.volume = newVolume;

		if (this._virtual && this._playing && newVolume >= VOLUME_FLOOR) {
			let newTime = this.getDuration() - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(newTime);
			this._audioFile.play();
			this._virtual = false;
		} else if (!this._virtual && this._playing && newVolume < VOLUME_FLOOR) {
			this._audioFile.pause();
			this._virtual = true;
		}
	}
	
	getVolume() { 
		return super.getVolume() * !this._vMan.getMuted(); 
	}

	setMixVolume(newVolume) {
		this._mixVolume = newVolume;

		this.updateVolume();
	}

	setTime(time) {
		let newTime = time % this.getDuration();
		while (newTime < 0) { newTime += this.getDuration();}
		this._audioFile.currentTime = newTime;
		if (this._playing) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	getTime() { 
		return this._audioFile.currentTime;
	}

	getPlaying() { 
		return this._playing; 
	}

	getAudioFile() {
		return this._audioFile;
	}

	setVolumeManager(newManager) {
		this._vMan.removeFromList(this);
		this._vMan = newManager;
		this._vMan.addToList(this);

		this.updateVolume();

		if (this.getPlaying() && this._vMan.getPaused()) {
			this.pause();
			this._vMan.updateItemOnResumeList(this);
		}
	}
}

class clipLoop extends clip {
	constructor(filename) {
		super(filename);

		this._audioFile.loop = true;
	}

	trigger(callSign) {
		if(callSign == "tick") {
			this._tick++;
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}
}

class clipOverlap extends clip {
	constructor(filename, voices = 2) {
		super(filename);

		if (voices < 1) voices = 1;
		this._audioFiles = new Array(voices);
		this._maxVoices = this._audioFiles.length;
		this._currentFile = 0;
		this._scheduledFile = 0;

		this._audioFiles[0] = this._audioFile;
		for (let i = 1; i < this._maxVoices; i++) {
			this._audioFiles[i] = new Audio(audioPath+filename);
			this._audioFiles[i].pause();
		}
	}

	play() {
		this._currentFile = this._scheduledFile;
		this._scheduledFile = (this._currentFile + 1) % this._maxVoices;

		this._audioFile = this._audioFiles[this._currentFile];
		super.play();
	}

	stop() {
		super.stop();

		for (let i in this._audioFiles) {
			this._audioFiles[i].pause();
			this._audioFiles[i].currentTime = 0;
		}

		this._currentFile = this._scheduledFile;
		this._audioFile = this._audioFiles[this._currentFile];
	}

	resume() {
		super.resume();

		this._scheduledFile = (this._currentFile + 1) % this._maxVoices;
	}

	pause() {
		super.pause();

		for (let i in this._audioFiles) {
			this._audioFiles[i].pause();
		}
	}

	updateVolume() {
		let newVolume = this.getVolume() * this._mixVolume * this._vMan.getVolume();
		newVolume = newVolume*newVolume;
		if (newVolume > 1) {newVolume = 1;}
		if (newVolume < 0) {newVolume = 0;}

		for (let i in this._audioFiles) {
			this._audioFiles[i].volume = newVolume;
		}

		if (this._virtual && this._playing && newVolume >= VOLUME_FLOOR) {
			let newTime = this._duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(newTime);
			this._audioFile.play();
			this._virtual = false;
		} else if (!this._virtual && this._playing && newVolume < VOLUME_FLOOR) {
			this._audioFile.pause();
			this._virtual = true;
		}
	}

	getAudioFile() {
		return this._audioFiles[this._currentFile];
	}
}

class clipWTail extends clip {
	constructor(filename, playLength) {
		super(filename);

		this._audioFile.onloadedmetadata = function() {}
		this._duration = playLength;
	}
}

class clipOverlapWTail extends clipOverlap {
	constructor(filename, playLength, voices = 2) {
		super(filename, voices);

		this._audioFile.onloadedmetadata = function() {}
		this._duration = playLength;
	}
}

class clipLoopOverlapWTail extends clipOverlapWTail {
	constructor(filename, playLength, voices = 2) {
		super(filename, playLength, voices);
	}

	trigger(callSign) {
		if (callSign == "tick") {
			this._tick++;
			this.play();
		}
	}
}

class soundSpriteSheet extends basePlayable { // FIX maybe extend clip? what is the overlap
	constructor(filename, listOfTimePairs) {
		super();

		this.name = filename;

		this._audioFile = new Audio(audioPath+filename);
		this._times = listOfTimePairs;
		this._currentClip = 0;
		this._scheduledClip = 0;
		this._totalClips = this._times.length;
		this._spriteVolume = [];

		this._mixVolume = 1;
		this._playing = false;
		this._virtual = false;

		this._audioFile.pause();

		this._vMan = MasterVolumeManager;
		this._vMan.addToList(this);

		for (let i in this._times) {
			this._spriteVolume.push(1);
		}
	}

	play() {
		this._currentClip = this._scheduledClip;

		this._audioFile.currentTime = this._times[this._currentClip][0];
		this.resume();
	}

	stop() {
		this._playing = false;
		this.pause();

		this._currentClip = this._scheduledClip;
		this._audioFile.currentTime = this._times[this._currentClip][0];
	}

	resume() {
		this.updateVolume();
		if (this.getVolume() > VOLUME_FLOOR) {
			this._audioFile.play();
		} else {
			this._virtual = true;
		}
		AudioEventManager.addStopEvent(this, (this.getDuration(this._currentClip) - this.getTime()));
		AudioEventManager.addTimerEvent(this, (this.getDuration(this._currentClip) - this.getTime()), "tick");
		this._playing = true;
	}

	pause() {
		if (this._playing && this._virtual) {
			this._audioFile.currentTime = this._times[this._currentClip][1] - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {
			this._audioFile.pause();
		}
		AudioEventManager.removeStopEvent(this);
		AudioEventManager.removeTimerEvent(this);
		this._playing = false;
		this._virtual = false;
	}

	trigger(callSign) {
		if(callSign == "tick") {
			this._tick++;
			this._playing = false;
		}
	}

	setScheduledClip(clipNumber) {
		this._scheduledClip = clipNumber;

		if (!this.getPlaying()) {
			this._currentClip = this._scheduledClip;
			this._audioFile.currentTime = this._times[this._currentClip][0];
		}
	}

	getCurrentClip() {
		return this._currentClip;
	}

	getTimePair(clipNumber) {
		return this._times[clipNumber];
	}

	updateVolume() {
		let newVolume = this.getVolume() * this._mixVolume * this._spriteVolume[this._currentClip] * this._vMan.getVolume();
		newVolume = newVolume*newVolume;
		if (newVolume > 1) {newVolume = 1;}
		if (newVolume < 0) {newVolume = 0;}

		this._audioFile.volume = newVolume;

		if (this._virtual && this._playing && newVolume >= VOLUME_FLOOR) {
			let newTime = this.getDuration() - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(newTime);
			this._audioFile.play();
			this._virtual = false;
		} else if (!this._virtual && this._playing && newVolume < VOLUME_FLOOR) {
			this._audioFile.pause();
			this._virtual = true;
		}
	}
	
	getVolume() { 
		return super.getVolume() * !this._vMan.getMuted(); 
	}

	setMixVolume(newVolume) {
		this._mixVolume = newVolume;

		this.updateVolume();
	}

	setSpriteVolume(clipNumber, volume) {
		this._spriteVolume[clipNumber] = volume;

		if (clipNumber == this._currentClip) this.updateVolume();
	}

	setTime(time) {
		time = time % this.getDuration();
		this._audioFile.currentTime = this._times[this._currentClip][0] + time;
		if (this.getPlaying()) {
			AudioEventManager.addStopEvent(this, this.getDuration() - this.getTime());
			AudioEventManager.addTimerEvent(this, this.getDuration() - this.getTime(), "tick");
		}
	}

	getTime() { 
		return this.getClipTime(this._currentClip);
	}

	getClipTime(clipNumber) { 
		return this._audioFile.currentTime - this._times[clipNumber][0];
	}

	getDuration() {
		return this.getClipDuration(this._currentClip);
	}
	
	getClipDuration(clipNumber) {
		return this._times[clipNumber][1] - this._times[clipNumber][0];
	}

	getPlaying() { 
		return this._playing; 
	}

	getAudioFile() {
		return this._audioFile;
	}

	setVolumeManager(newManager) {
		this._vMan.removeFromList(this);
		this._vMan = newManager;
		this._vMan.addToList(this);

		this.updateVolume();

		if (this.getPlaying() && this._vMan.getPaused()) {
			this.pause();
			this._vMan.updateItemOnResumeList(this);
		}
	}
}

class soundSprite extends basePlayable {
	constructor(spriteSheet, clipNumber) {
		super();

		this.name = spriteSheet.name + " " + clipNumber;

		this._spriteFile = spriteSheet;
		this._clip = clipNumber;
		this._duration = this._spriteFile.getClipDuration(clipNumber);
		this._mixVolume = 1;
		this._lastTime = 0;
		this._playing = false;
	}

	play() {
		this._spriteFile.setScheduledClip(this._clip);
		this._spriteFile.play();
		this._playing = true;

		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	stop() {
		if(this._spriteFile.getCurrentClip() == this._clip) {
			this._spriteFile.stop();
		}
		this._lastTime = 0;
		this._playing = false;

		AudioEventManager.removeTimerEvent(this);
	}

	resume() {
		if(this._spriteFile.getCurrentClip() == this._clip) {
			this._spriteFile.resume();
		} else if (!this._spriteFile.getPlaying()) {
			this._spriteFile.setScheduledClip(this._clip);
			this._spriteFile.setTime(this._lastTime);
			this._spriteFile.resume();
		}
		this._playing = true;

		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	pause() {
		if(this._spriteFile.getCurrentClip() == this._clip) {
			this._spriteFile.pause();
		}
		this._lastTime = this.getTime();
		this._playing = false;

		AudioEventManager.removeTimerEvent(this);
	}

	trigger(callSign) {
		if(callSign == "tick") {
			this._tick++;
			this._playing = false;
			this._lastTime = 0;
		}
	}

	updateVolume() {
		if(this._spriteFile.getCurrentClip() == this._clip) {
			this._spriteFile.updateVolume();	
		}
			
	}

	setVolume(newVolume) {
		super.setVolume(newVolume);
		this._spriteFile.setSpriteVolume(this._clip, this.getVolume());
	}

	getVolume() {
		return super.getVolume() * this._mixVolume;
	}

	setMixVolume(newVolume) {
		this._mixVolume = newVolume;

		this.updateVolume();
	}

	setTime = function(time) {
		this._lastTime = time;

		if (this.getPlaying()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
		if(this._spriteFile.getCurrentClip() == this._clip) {
			this._spriteFile.setTime(time);
		}
	}

	getTime() {
		if (this.getPlaying()) {
			return this.getDuration() - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");;
		} else {
			return this._lastTime;
		}
	}

	getSourceClip() {
		return this._spriteFile.getSourceClip();
	}

	getAudioFile() {
		return this.getSourceClip().getAudioFile();
	}

	getPlaying() { 
		return this._playing; 
	}
}

class container extends basePlayable {
	constructor(clipList) {
		super();

		this.name = "container";

		this._clipList = [];
		this._currentClip = 0;
		this._scheduledClip = 0;

		for (let i in clipList) {
			this._clipList.push(clipList[i]);
		}
	}

	play() {
		this._currentClip = this._scheduledClip;

		this._clipList[this._currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	stop() {
		for (let i in this._clipList) {
			this._clipList[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
		this._currentClip = this._scheduledClip;
	}

	resume() {
		this._clipList[this._currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	pause() {
		for (let i in this._clipList) {
			this._clipList[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	updateVolume() {
		for (let i in this._clipList) {
			this._clipList[i].updateVolume();
		}
	}

	setVolume(newVolume) {
		this._volume = newVolume;

		for (let i in this._clipList) {
			this._clipList[i].setVolume(this.getVolume());
		}
	}

	getSourceClip() {
		return this._clipList[this._currentClip].getSourceClip();
	}

	getAudioFile() {
		return this.getSourceClip().getAudioFile();
	}

	setScheduledClip(clipNumber) {
		if (clipNumber < 0 || clipNumber >= this._clipList.length) return;

		this._scheduledClip = clipNumber;
		if (!this.getPlaying()) {
			this._currentClip = this._scheduledClip;
			this.setTime(0);
		}
	}

	getCurrentClip() {
		return this._currentClip;
	}

	setTime(time) {
		this._clipList[this._currentClip].setTime(time);
		if (this.getPlaying()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	getTime() {
		return this._clipList[this._currentClip].getTime();
	}
	
	getDuration() {
		return this._clipList[this._currentClip].getDuration();
	}

	getPlaying() {
		return this._clipList[this._currentClip].getPlaying();
	}
}

class containerRandom extends container {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerRandom";

		this._scheduledClip = Math.floor(Math.random() * this._clipList.length);
	}

	play() {
		super.play();

		this._scheduledClip = Math.floor(Math.random() * this._clipList.length);
		if (this._scheduledClip == this._currentClip) {
			this._scheduledClip = this._scheduledClip++ % this._clipList.length;
		}
	}
}

class containerLoop extends container {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerLoop";
	}

	trigger(callSign) {
		if (callSign == "tick") {
			this._tick++;
			this.play();
		}
	}
}

class containerRandomLoop extends containerRandom {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerRandomLoop";
	}

	trigger(callSign) {
		if (callSign == "tick") {
			this._tick++;
			this.play();
		}
	}
}

class containerRandomLoopRepetitionControl extends containerRandomLoop {
	constructor(clipList, maxRepetitions = 3, minRepetitions = 1) {
		super(clipList);
		
		this.name = "containerRandomLoopRepetitionControl";

		this._playCountdown = 0;
		this._playMax = maxRepetitions;
		this._playMin = minRepetitions;
	}

	play() {
		if (this._playCountdown <= 0) {
			this._currentClip = this._scheduledClip;
			this._scheduledClip = Math.floor(Math.random() * this._clipList.length);
			if (this._scheduledClip == this._currentClip) {
				this._scheduledClip = this._scheduledClip++ % this._clipList.length;
			}
			this._playCountdown = Math.floor(Math.random() * (this._playMax - this._playMin + 1) + this._playMin);
		}

		super.play();
		this._playCountdown--;
	}

	stop() {
		super.stop();
		this._playCountdown = 0;
	}

	setScheduledClip(clipNumber) {
		this._scheduledClip = clipNumber;
		if (!this.getPlaying()) {
			this._currentClip = this._scheduledClip;
			this._playCountdown = 0;
		}
	}
}

class containerRandomLoopDurationControl extends containerRandomLoop {
	constructor(clipList, maxDurationInSeconds = 180, minDurationInSeconds = 60) {
		super(clipList);
		
		this.name = "containerRandomLoopDurationControl";

		this._playTime = 0;
		this._nextTime = 0;
		this._playMax = maxDurationInSeconds;
		this._playMin = minDurationInSeconds;
	}

	play() {
		if (this._playTime >= this._nextTime) {
			this._currentClip = this._scheduledClip;
			this._scheduledClip = Math.floor(Math.random() * this._clipList.length);
			if (this._scheduledClip == this._currentClip) {
				this._scheduledClip = this._scheduledClip++ % this._clipList.length;
			}
			this._playTime = 0;
			this._nextTime = Math.random() * (this._playMax - this._playMin) + this._playMin;
		}

		super.play();
		this._playTime += this._clipList[this._currentClip].getDuration();
	}

	stop() {
		super.stop();
		this._playTime -= this.getDuration() - this.getTime();
	}

	setScheduledClip(clipNumber) {
		this._scheduledClip = clipNumber;
		if (!this.getPlaying()) {
			this._currentClip = this._scheduledClip;
			this._playTime = 0;
		}
	}
}

class containerDelayControl extends container {
	constructor(clipList, maxDurationInSeconds = 1, minDurationInSeconds = 0) {
		super(clipList);
		
		this.name = "containerDelayControl";

		this._playMax = maxDurationInSeconds;
		this._playMin = minDurationInSeconds;
		this._delayTime = (Math.random() * this._playMax - this._playMin) + this._playMin;
		this._schedualedDelayTime = this._delayTime;
		this._timeLeft = this._delayTime;
		this._playing = false;
	}

	play() {
		this._currentClip = this._scheduledClip;
		this._timeLeft = this._delayTime;
		this._delayTime = this._schedualedDelayTime;
		this._schedualedDelayTime = (Math.random() * this._playMax - this._playMin) + this._playMin;

		AudioEventManager.addPlayEvent(this._clipList[this._currentClip], this._delayTime);
		AudioEventManager.addTimerEvent(this, (this._delayTime + this._clipList[this._currentClip].getDuration()), "tick");
		this._playing = true;
	}

	stop() {
		for (let i in this._clipList) {
			this._clipList[i].stop();
		}
		AudioEventManager.removePlayEvent(this._clipList[this._currentClip]);
		AudioEventManager.removeTimerEvent(this);
		this._currentClip = this._scheduledClip;
		this._delayTime = this._schedualedDelayTime;
		this._playing = false;
	}

	resume() {
		if (this._timeLeft > 0) {
			AudioEventManager.addPlayEvent(this._clipList[this._currentClip], this._timeLeft);
			AudioEventManager.addTimerEvent(this, (this._timeLeft + this._clipList[this._currentClip].getDuration()), "tick");
		} else {
			this._clipList[this._currentClip].resume();
			AudioEventManager.addTimerEvent(this, (this._clipList[this._currentClip].getDuration() - this._clipList[this._currentClip].getTime()), "tick");
		}
		this._playing = true;
	}

	pause() {
		for (let i in this._clipList) {
			this._clipList[i].pause();
		}
		this._timeLeft = AudioEventManager.getEventSecondsRemaining(PLAY, this._clipList[this._currentClip]);
		AudioEventManager.removePlayEvent(this._clipList[this._currentClip]);
		AudioEventManager.removeTimerEvent(this);
		this._playing = false;
	}

	trigger(callSign) {
		if(callSign == "tick") {
			this._tick++;
			this._playing = false;
			this._delayTime = (Math.random() * playMax - playMin) + playMin;
		}
	}

	setTime(time) {
		if (time > this._delayTime) {
			this._clipList[this._currentClip].setTime(time - this._delayTime);

			if (this._clipList[this._currentClip].getPlaying()) {
				AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
			} else if (this.getPlaying()) {
				this._clipList[this._currentClip].resume();
				AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
			}
		} else {
			this._timeLeft = this._delayTime - time;
			AudioEventManager.addPlayEvent(this._clipList[this._currentClip], this._timeLeft);
			AudioEventManager.addTimerEvent(this, (this._timeLeft + this._clipList[this._currentClip].getDuration()), "tick");
		}
	}

	getTime() {
		let delayRemaining = AudioEventManager.getEventSecondsRemaining(PLAY, this._clipList[this._currentClip]);
		return this._clipList[this._currentClip].getTime() + this._delayTime - delayRemaining;
	}
	
	getDuration() {
		return this._clipList[this._currentClip].getDuration() + this._delayTime;
	}

	getPlaying() {
		return this._playing;
	}
}

class containerLayer extends container {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerLayer";

		this._layerVolume = [];

		for (let i in clipList) {
			this._layerVolume.push(1);
		}
	}

	play() {
		for (let i in this._clipList) {
			this._clipList[i].play();
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	resume() {
		for (let i in this._clipList) {
			this._clipList[i].resume();
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	setScheduledClip(clipNumber) {}

	setLayerLevel(slot, level) {
		if (slot < 0 || slot >= this._clipList.length) return;

		this._layerVolume[slot] = level;
		this._clipList[slot].setVolume(this.getVolume() * this._layerVolume[slot]);
	}

	setVolume(newVolume) {
		this._volume = newVolume;

		for (let i in this._clipList) {
			this._clipList[i].setVolume(this.getVolume() * this._layerVolume[i]);
		}
	}

	setTime(time) {
		for (let i in this._clipList) {
			this._clipList[i].setTime(time);
		}
		if (this.getPlaying()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	getTime() {
		let duration = 0;
		let longestClip = 0;
		for (let i in this._clipList) {
			if (this._clipList[i].getDuration() > duration) {
				duration = this._clipList[i].getDuration();
				longestClip = i
			}
		}

		return this._clipList[longestClip].getTime();
	}

	getDuration() {
		let duration = 0;
		for (let i in this._clipList) {
			if (this._clipList[i].getDuration() > duration) {
				duration = this._clipList[i].getDuration();
			}
		}
		return duration;
	}

	getPlaying() {
		for (let i in this._clipList) {
			if (this._clipList[i].getPlaying()) return true;
		}
		return false;
	}
}

class containerLayerLoop extends containerLayer {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerLayerLoop";
	}

	trigger(callSign) {
		if (callSign == "tick") {
			this.play();
			this._tick++;
		}
	}
}

class containerBlend extends containerLayer {
	constructor(clipList, startingLevel = 0) {
		super(clipList);
		
		this.name = "containerBlend";

		this._currentLevel = startingLevel;
		this._overlap = 1 / (this._clipList.length-1);
	}


	_defineVolumes() {
		for (let i = 0; i < this._clipList.length; i++) {
			let relativeLevel = Math.abs(this._currentLevel - i*this._overlap);
			if (relativeLevel >= this._overlap) {
				this._layerVolume[i] = 0;
			}
			if (relativeLevel < this._overlap) {
				this._layerVolume[i] = Math.abs(1 - relativeLevel / this._overlap) * this.getVolume();
			}
		}
		this.updateVolume();
	}

	play() {
		this._defineVolumes();
		super.play();
	}

	resume() {
		this._defineVolumes();
		super.resume();
	}

	setLevel(newLevel) {
		this._currentLevel = newLevel;
		this._defineVolumes();
	}
}

class containerConcatenated extends container {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerConcatenated";

		this._duration = 0;
		for (let i in this._clipList) {
			this._duration += this._clipList[i].getDuration();
		}
	}

	play() {
		this._clipList[this._currentClip].play();
		AudioEventManager.addTimerEvent(this, this._clipList[this._currentClip].getDuration(), "tick");
	}

	stop() {
		for (let i in this._clipList) {
			this._clipList[i].stop();
		}
		this._currentClip = 0;
		AudioEventManager.removeTimerEvent(this);
	}

	resume() {
		this._clipList[this._currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this._clipList[this._currentClip].getDuration() - this._clipList[this._currentClip].getTime()), "tick");
	}

	pause() {
		for (let i in this._clipList) {
			this._clipList[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	trigger(callSign) {
		if(callSign == "tick") {
			this._currentClip++;
			if (this._currentClip < this._clipList.length) {
				this.play();
			} else {
				this._currentClip = 0;
				this._tick++;
			}
		}
	}

	setScheduledClip(clipNumber) {}

	getCurrentClip() { return 0; }

	setTime(time) {
		let totalTime = time;
		for (let i in this._clipList) {
			if (this._clipList[i].getDuration() > totalTime) {
				totalTime -= this._clipList[i].getDuration();
			} else if (this._clipList[i].getDuration() <= totalTime) {
				this._currentClip = i;
				this._clipList[currentClip].setTime(totalTime);
				
				break;
			}
		}
		if(this.getPlaying()) {
			AudioEventManager.addTimerEvent(this, (this._clipList[this._currentClip].getDuration() - this._clipList[this._currentClip].getTime()), "tick");
		}
	}

	getTime() {
		let totalTime = 0;
		for (let i in this._clipList) {
			if (i < this._currentClip) {
				totalTime += this._clipList[i].getDuration();
			} else if (i == currentClip) {
				totalTime += this._clipList[i].getTime();
			}
		}
		return totalTime;
	}
	
	getDuration() {
		return this._duration;
	}
}

class containerConcatenatedLatchLast extends containerConcatenated {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerConcatenatedLatchLast";

		this._atEnd = false;
	}

	stop() {
		for (let i in this._clipList) {
			this._clipList[i].stop();
		}
		if (!this._atEnd) {
			this._currentClip = 0;
		}
		AudioEventManager.removeTimerEvent(this);
	}

	trigger(callSign) {
		if(callSign == "tick") {
			if (this._currentClip < this._clipList.length - 1) {
				this._currentClip++;
				this.play();
			} 
			if (this._currentClip >= this._clipList.length - 1) {
				this._atEnd = true;
				this._tick++;
			}
		}
	}

	setTime(time) {
		if (this._atEnd) {
			this._clipList[currentClip].setTime(time);
		} else {
			let totalTime = time;
			for (let i in this._clipList) {
				if (this._clipList[i].getDuration() > totalTime) {
					totalTime -= this._clipList[i].getDuration();
				} else if (this._clipList[i].getDuration() <= totalTime) {
					this._currentClip = i;
					this._clipList[currentClip].setTime(totalTime);

					if (this._currentClip >= this._clipList.length - 1) {
						this._atEnd = true;
					}

					break;
				}
			}
		}

		if(this.getPlaying()) {
			AudioEventManager.addTimerEvent(this, (this._clipList[this._currentClip].getDuration() - this._clipList[this._currentClip].getTime()), "tick");
		}
	}

	getTime() {
		let totalTime = 0;
		if (this._atEnd) {
			totalTime = this._clipList[this._currentClip].getTime();
		} else {
			for (let i in this._clipList) {
				if (i < this._currentClip) {
					totalTime += this._clipList[i].getDuration();
				} else if (i == this._currentClip) {
					totalTime += this._clipList[i].getTime();
				}
			}
		}
		return totalTime;
	}
	
	getDuration() {
		if (this._atEnd) {
			return this._clipList[this._currentClip].getDuration();
		} else {
			return this._duration;
		}
	}
}

class containerConcatenatedLoop extends containerConcatenated {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerConcatenatedLoop";
	}

	trigger(callSign) {
		if(callSign == "tick") {
			this._currentClip++;
			if (this._currentClip < this._clipList.length) {
				this.play();
			} else {
				this._tick++;
				this._currentClip = 0;
				this.play();
			}
		}
	}
}

class containerConcatenatedLoopLast extends containerConcatenatedLatchLast {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerConcatenatedLoopLast";
	}

	trigger(callSign) {
		if(callSign == "tick") {
			if (this._currentClip < this._clipList.length - 1) {
				this._currentClip++;
			} 
			if (this._currentClip >= this._clipList.length - 1) {
				this._atEnd = true;
				this._tick++;
			}

			this.play();
		}
	}
}

class containerCrossfade extends container {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerCrossfade";

		for (let i in this._clipList) {
			this._clipList[i].setVolume(0);
		}
		this._clipList[this._currentClip].setVolume(1);
	}

	switch(fadeTime = 0.5) {
		if (this._currentClip == this._scheduledClip) return;

		if(this.getPlaying()) {
			this._clipList[this._scheduledClip].setTime(this._clipList[this._currentClip].getTime());
			this._clipList[this._scheduledClip].resume();
			AudioEventManager.addCrossfadeEvent(this._clipList[this._currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(this._clipList[this._scheduledClip], fadeTime, this.getVolume());
			this._currentClip = this._scheduledClip;
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		} else {
			this._currentClip = this._scheduledClip;
		}
	}

	switchTo(slot, fadeTime = 0.5) {
		this.setScheduledClip(slot);
		this.switch(fadeTime);
	}
}

class containerCrossfadeLoop extends containerCrossfade {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerCrossfadeLoop";
	}

	trigger(callSign) {
		if (callSign == "tick") {
			this.play();
			this._tick++;
		}
	}
}

class containerSequence extends container {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerSequence";
	}

	play() {
		this._currentClip = this._scheduledClip;
		this._scheduledClip = this._scheduledClip++ % this._clipList.length;

		this._clipList[this._currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}
}

class containerSequenceLatchLast extends containerSequence {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerSequenceLatchLast";
	}

	play() {
		this._currentClip = this._scheduledClip;
		if (this._scheduledClip < this._clipList.length - 1) this._scheduledClip++;

		this._clipList[this._currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}
}

class containerPlaylist extends containerSequence {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerPlaylist";
	}

	trigger(callSign) {
		if(callSign == "tick") {
			this._currentClip++;
			if (this._currentClip < this._clipList.length) {
				this.play();
			}
			this._tick++;
		}
	}
}

class containerPlaylistLoop extends containerPlaylist {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerPlaylistLoop";
	}

	trigger(callSign) {
		if(callSign == "tick") {
			this.play();
			this._tick++;
		}
	}
}

class containerPlaylistLoopLast extends containerPlaylistLoop {
	constructor(clipList) {
		super(clipList);
		
		this.name = "containerPlaylistLoopLast";
	}

	play() {
		this._currentClip = this._scheduledClip;
		if (this._scheduledClip < this._clipList.length - 1) this._scheduledClip++;

		this._clipList[this._currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}
}