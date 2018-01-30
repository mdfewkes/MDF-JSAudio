var sfxVolume = 1;
var isMuted = false;

function setSFXVolume(amount) {
	sfxVolume = amount;
}

function getSFXVolume() {
	return sfxVolume;
}

function getRandomVolume(){
	var min = 0.85;
	var max = 1;
	var randomVolume = Math.random() * (max - min) + min;
	return randomVolume.toFixed(2);
}

function getRandomRate(){
	var min = 0.85;
	var max = 1.15;
	var randomVolume = Math.random() * (max - min) + min;
	return randomVolume.toFixed(2);
}

function sfxClip(filenameWithPath) {
	var soundFile = new Audio(filenameWithPath+audioFormat);
	var clipVolume = 1;
	var randVolume = true;
	var randRate = true
	var clipName = filenameWithPath;
	var duration = soundFile.duration;

	soundFile.pause();

	this.play = function() {
		soundFile.currentTime = 0;
		this.updateVolume();
		soundFile.play();
	}

	this.stop = function() {
		soundFile.pause();
		soundFile.currentTime = 0;
	}

	this.resume = function() {
		soundFile.play();
	}

	this.pause = function() {
		soundFile.pause();
	}

	function setRandomRate() {
		this.setPlaybackRate(getRandomRate());
	}

	this.updateVolume = function() {
		if (randVolume) {
			soundFile.volume = Math.pow(sfxVolume * clipVolume * getRandomVolume() * !isMuted, 2);
		} else {
			soundFile.volume = Math.pow(sfxVolume * clipVolume * !isMuted, 2);
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		soundFile.volume = Math.pow(newVolume * sfxVolume * !isMuted, 2);
		clipVolume = newVolume;
	}

	this.getVolume = function() {
		return sfxVolume  * clipVolume * !isMuted;
	}

	this.setPlaybackRate = function(rate) {
		soundFile.playbackRate = rate;
	}

	this.getPlaybackRate = function() {
		return soundFile.playbackRate;
	}

	this.setTime = function(time) {
		soundFile.currentTime = time;
	}

	this.getTime = function() {
		return soundFile.currentTime;
	}

	this.setPlaybackRate = function(rate) {
		soundFile.playbackRate = rate;
	}

	this.getPlaybackRate = function() {
		return soundFile.playbackRate;
	}
	
	this.setClipName = function(name) {
		clipName = name;
	}

	this.getClipName = function() {
		return clipName;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return soundFile.paused;
	}
}

