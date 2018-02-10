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

function sfxClipSingle(filenameWithPath) {
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
		return sfxVolume * clipVolume * !isMuted;
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

function sfxClipDouble(filenameWithPath) {
	var soundFile0 = new Audio(filenameWithPath+audioFormat);
	var soundFile1 = new Audio(filenameWithPath+audioFormat);
	var currentClip = 0;
	var clipVolume = 1;
	var randVolume = true;
	var randRate = true
	var clipName = filenameWithPath;
	var duration = soundFile0.duration;

	soundFile0.pause();
	soundFile1.pause();

	this.play = function() {
		currentClip++;
		if (currentClip >1) {currentClip = 0;}

		if (currentClip == 0) {
			soundFile0.currentTime = 0;
			this.updateVolume();
			soundFile0.play();
		} else {
			soundFile1.currentTime = 0;
			this.updateVolume();
			soundFile1.play();
		}
	}

	this.stop = function() {
		soundFile0.pause();
		soundFile0.currentTime = 0;
		soundFile1.pause();
		soundFile1.currentTime = 0;
	}

	this.resume = function() {
		if (currentClip == 0) {soundFile0.play();}
		else {soundFile1.play();}

	}

	this.pause = function() {
		soundFile0.pause();
		soundFile1.pause();
	}

	function setRandomRate() {
		this.setPlaybackRate(getRandomRate());
	}

	this.updateVolume = function() {
		if (randVolume) {
			soundFile0.volume = Math.pow(sfxVolume * clipVolume * getRandomVolume() * !isMuted, 2);
			soundFile1.volume = Math.pow(sfxVolume * clipVolume * getRandomVolume() * !isMuted, 2);
		} else {
			soundFile0.volume = Math.pow(sfxVolume * clipVolume * !isMuted, 2);
			soundFile1.volume = Math.pow(sfxVolume * clipVolume * !isMuted, 2);
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		soundFile0.volume = Math.pow(newVolume * sfxVolume * !isMuted, 2);
		soundFile1.volume = Math.pow(newVolume * sfxVolume * !isMuted, 2);
		clipVolume = newVolume;
	}

	this.getVolume = function() {
		return sfxVolume * clipVolume * !isMuted;
	}

	this.setTime = function(time) {
		if (currentClip == 0) {soundFile0.currentTime = time;}
		else {soundFile1.currentTime = time;}
	}

	this.getTime = function() {
		if (currentClip == 0) {return soundFile0.currentTime;}
		else {return soundFile1.currentTime;}
	}

	this.setPlaybackRate = function(rate) {
		soundFile0.playbackRate = rate;
		soundFile1.playbackRate = rate;
	}

	this.getPlaybackRate = function() {
		if (currentClip == 0) {return soundFile0.playbackRate;}
		else {return soundFile1.playbackRate;}

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
		return soundFile0.paused;
	}
}

function sfxClipOverlap(filenameWithPath, voices) {
	var soundFile = new array(voices);
	var maxVoices = soundfile.length;

	for (var i in soundFile) {
		soundFile[i] = new Audio(filenameWithPath+audioFormat);
		soundFile[i].pause();
	}

	var currentClip = 0;
	var clipVolume = 1;
	var randVolume = true;
	var randRate = true
	var clipName = filenameWithPath;
	var duration = soundFile[0].duration;

	this.play = function() {
		currentClip++;
		if (currentClip >= maxVoices) {currentClip = 0;}

		soundFile[currentClip].currentTime = 0;
		this.updateVolume();
		soundFile[currentClip].play();
	}

	this.stop = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
			soundFile[i].currentTime = 0;
		}
	}

	this.resume = function() {
		soundFile[currentClip].play();

	}

	this.pause = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
		}
	}

	function setRandomRate() {
		this.setPlaybackRate(getRandomRate());
	}

	this.updateVolume = function() {
		if (randVolume) {
			for (var i in soundFile) {
				soundFile[i].volume = Math.pow(sfxVolume * clipVolume * getRandomVolume() * !isMuted, 2);
			}
		} else {
			for (var i in soundFile) {
				soundFile[i].volume = Math.pow(sfxVolume * clipVolume * !isMuted, 2);
			}
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		for (var i in soundFile) {
			soundFile[i].volume = Math.pow(newVolume * sfxVolume * !isMuted, 2);
		}
		clipVolume = newVolume;
	}

	this.getVolume = function() {
		return sfxVolume * clipVolume * !isMuted;
	}

	this.setTime = function(time) {
		soundFile.currentTime[currentClip] = time;

	this.getTime = function() {
		return soundFile[currentClip].currentTime;
	}

	this.setPlaybackRate = function(rate) {
		soundFile.playbackRate[currentClip] = rate;
	}

	this.getPlaybackRate = function() {
		return soundFile[currentClip].playbackRate;
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
		return soundFile[currentClip].paused;
	}
}