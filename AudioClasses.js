/*
AudioClasses.js and AudioManager,js are an attemp my Michael Fewkes to make more complex audio behaviors simpler to implement.

Functions that all sound objects share:
.play()    plays from the beggining of the audio file
.stop()	    stops playback and resets playback time
.resume()    plays file from last playback time
.pause()    stops playback without resetting playback time
.setVolume()/.getVolume()    reports and sets object volume
.setMixLevel()    sets a volume pre setVolume(), used for settimg a volume relative to the mix
.setTime()/.getTime()    controls the playback time
.getDuration()    reports the duration of the file
.getPaused()    reports true is the file is not currently playing

*/

//General
volumeManagerList = [];
function volumeManager() {
	var list = [];
	var volume = 1;
	var muted = false;
	volumeManagerList.push(this);

	this.setVolume = function(amount) {
		if (amount > 1) {volume = 1;}
		else if (amount < 0) {volume = 0;}
		else {volume = amount;}
		for (var i in list) {
			list[i].updateVolume();
		}
	}

	this.getVolume = function() {
		return volume;
	}

	this.setMuted = function(ToF) {
		muted = ToF;
		this.updateVolume();
	}

	this.getMuted = function() {
		return muted;
	}

	this.updateVolume = function() {
		for(var i in list) {
			list[i].updateVolume();
		}
	}

	this.addToList = function(item) {
		list.push(item);
	}

	this.stopAll = function() {
		for(var i in list) {
			list[i].stop();
		}
	}

	this.pauseAll = function() {
		for(var i in list) {
			list[i].pause();
		}
	}

	this.play = function(name) {
		var searching = true;
		var i = 0;
		while(searching) {
			if (name == list[i].name) {
				list[i].play();
				searching = false;
			}
		i++;
		}
	}

	this.stop = function(name) {
		var searching = true;
		var i = 0;
		while(searching) {
			if (name == list[i].name) {
				list[i].stop();
				searching = false;
			}
		i++;
		}
	}

	this.resume = function(name) {
		var searching = true;
		var i = 0;
		while(searching) {
			if (name == list[i].name) {
				list[i].resume();
				searching = false;
			}
		i++;
		}
	}

	this.pause = function(name) {
		var searching = true;
		var i = 0;
		while(searching) {
			if (name == list[i].name) {
				list[i].pause();
				searching = false;
			}
		i++;
		}
	}
}

//SFX Classes
SFXVolumeManager = new volumeManager();

function getRandomVolume(){
	var min = 0.85;
	var max = 1;
	var randomVolume = Math.random() * (max - min) + min;
	return randomVolume.toFixed(2);
}

function sfxClip(filename) {//A simple, single buffer sound clip
	var audioFile = new Audio(audioPath+filename+audioFormat());
	audioFile.onerror = function(){audioFile = new Audio(audioPath+filename+audioFormat(true))};
	var clipVolume = 1;
	var randVolume = true;
	this.name = filename;
	var duration = audioFile.duration;
	var mixVolume = 1;
	var playing = false;
	var tick = 0;

	audioFile.pause();
	var man = SFXVolumeManager;
	man.addToList(this);


	this.play = function() {
		audioFile.currentTime = 0;
		this.updateVolume();
		if (clipVolume > 0.1) {audioFile.play()};
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		playing = true;
	}

	this.stop = function() {
		audioFile.pause();
		AudioEventManager.removeTimerEvent(this);
		audioFile.currentTime = 0;
		playing = false;
	}

	this.resume = function() {
		if (clipVolume > 0.1) {audioFile.play()};
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile.paused && clipVolume < 0.1) {
			audioFile.currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
		} else {audioFile.pause();}
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		if (randVolume) {
			audioFile.volume = Math.pow(newVolume * man.getVolume() * getRandomVolume() * !man.getMuted(), 2);
		} else {
			audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && audioFile.paused && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			this.setTime(newTime);
			audioFile.play();
		}
		if(clipVolume < 0.1) {audioFile.pause();}
	}

	this.getVolume = function() {
		return clipVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceClip = function() {
		return this;
	}

	this.getChildClip = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioFile.currentTime = time;
		if (playing) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return audioFile.currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function sfxClipOverlap(filename, voices = 2) {//A sound clip with as many buffers as specified
	var audioFile = new Array(voices);
	var maxVoices = audioFile.length;
	for (var i = 0; i < audioFile.length; i++) {
		audioFile[i] = new Audio(audioPath+filename+audioFormat());
		audioFile[i].onerror = function(){audioFile[i] = new Audio(audioPath+filename+audioFormat(true))};
		audioFile[i].pause();
	}
	var currentClip = 0;
	var clipVolume = 1;
	var randVolume = true;
	this.name = filename;
	var duration = audioFile[0].duration;
	var mixVolume = 1;
	var playing = false;
	var tick = 0;


	var man = SFXVolumeManager;
	man.addToList(this);

	this.play = function() {
		currentClip++;
		if (currentClip >= maxVoices) {currentClip = 0;}

		audioFile[currentClip].currentTime = 0;
		this.updateVolume();
		if (clipVolume > 0.1) {audioFile[currentClip].play();};
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		playing = true;
	}

	this.stop = function() {
		for (var i in audioFile) {
			audioFile[i].pause();
			audioFile[i].currentTime = 0;
		}
		playing = false;
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		if (clipVolume > 0.1) {audioFile[currentClip].play();};
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile[currentClip].paused && clipVolume < 0.1) {
			audioFile[currentClip].currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
		} else {audioFile.pause();}

		for (var i in audioFile) {
			audioFile[i].pause();
		}
		playing = false;
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		if (randVolume) {
			for (var i in audioFile) {
				audioFile[i].volume = Math.pow(newVolume * man.getVolume() * getRandomVolume() * !man.getMuted(), 2);
			}
		} else {
			for (var i in audioFile) {
				audioFile[i].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
			}
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		for (var i in audioFile) {
			audioFile[i].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		}
		if(playing && audioFile[currentClip].paused && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			this.setTime(newTime);
			audioFile[currentClip].play();
		}
		if(clipVolume < 0.1) {
			audioFile[0].pause();
			audioFile[1].pause();
		}
	}

	this.getVolume = function() {
		return clipVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceClip = function() {
		return this;
	}

	this.getChildClip = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioFile.currentTime[currentClip] = time;
		if(playing) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return audioFile[currentClip].currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function sfxClipOverlapLoop(filename, playLength) {//Double buffer sound file that loops
	var audioFile = new Array(new Audio(audioPath+filename+audioFormat()), new Audio(audioPath+filename+audioFormat()));
	audioFile[0].onerror = function(){audioFile[0] = new Audio(audioPath+filename+audioFormat(true))}
	audioFile[1].onerror = function(){audioFile[1] = new Audio(audioPath+filename+audioFormat(true))}
	var currentClip = 0;
	var duration = playLength;
	this.name = filename;
	var clipVolume = 1;
	var mixVolume = 1;
	var playing = false;
	var tick = 0;

	audioFile[0].pause();
	audioFile[1].pause();
	var man = SFXVolumeManager;
	man.addToList(this);

	this.play = function() {
		audioFile[currentClip].currentTime = 0;
		this.updateVolume();
		if (clipVolume > 0.1) {audioFile[currentClip].play();};
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		playing = true;
	}

	this.stop = function() {
		audioFile[0].pause();
		audioFile[0].currentTime = 0;
		audioFile[1].pause();
		audioFile[1].currentTime = 0;
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.resume = function() {
		if (clipVolume > 0.1) {audioFile[currentClip].play();};
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile[0].paused && audioFile[1].paused && clipVolume < 0.1) {
			audioFile[currentClip].currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
		} else {
			audioFile[0].pause();
			audioFile[1].pause();
		}
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentClip++;
			if (currentClip > 1) {currentClip = 0;}
			this.play();
			tick++;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile[0].volume = Math.pow(newVolume  * man.getVolume() * !man.getMuted(), 2);
		audioFile[1].volume = Math.pow(newVolume  * man.getVolume() * !man.getMuted(), 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile[0].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		audioFile[1].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && audioFile[currentClip].paused && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			this.setTime(newTime);
			audioFile[currentClip].play();
		}
		if(clipVolume < 0.1) {
			audioFile[0].pause();
			audioFile[1].pause();
		}
	}

	this.getVolume = function() {
		return clipVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceClip = function() {
		return this;
	}

	this.getChildClip = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time;
		while (newTime >= duration) {newTime -= duration;}
		if(newTime < 0) {newTime = 0;}
		audioFile[currentClip].currentTime = newTime;
		if (playing) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return audioFile[currentClip].currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function sfxClipSpriteSheet(filename, listOfTimePairs) {//A single file holding several sound clips
	var audioFile = new Audio(audioPath+filename+audioFormat());
	audioFile.onerror = function(){audioFile = new Audio(audioPath+filename+audioFormat(true))};
	var times = listOfTimePairs;
	var clipVolume = 1;
	var randVolume = true;
	this.name = filename;
	var duration = audioFile.duration;
	var currentClip = 0;
	var totalClips = times.length;
	var mixVolume = 1;
	var playing = false;
	var tick = 0;

	audioFile.pause();
	var man = SFXVolumeManager;
	man.addToList(this);


	this.play = function() {
		var startAt = times[currentClip][0];
		audioFile.currentTime = startAt;
		this.updateVolume();
		if (clipVolume > 0.1) {audioFile.play();};
		AudioEventManager.addStopEvent(this, this.getClipDuration(currentClip));
		AudioEventManager.addTimerEvent(this, this.getClipDuration(currentClip), "cue");
		playing = true;
	}

	this.stop = function() {
		audioFile.pause();
		audioFile.currentTime = 0;
		AudioEventManager.removeStopEvent(this);
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.resume = function() {
		if (clipVolume > 0.1) {audioFile.play();};
		AudioEventManager.addStopEvent(this, (this.getClipDuration(currentClip) - (times[currentClip][1] - this.getTime())));
		AudioEventManager.addTimerEvent(this, (this.getClipDuration(currentClip) - (times[currentClip][1] - this.getTime())), "cue");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile.paused && clipVolume < 0.1) {
			audioFile.currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
		} else {audioFile.pause();}
		AudioEventManager.removeStopEvent(this);
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		if (randVolume) {
			audioFile.volume = Math.pow(newVolume * man.getVolume() * getRandomVolume() * !man.getMuted(), 2);
		} else {
			audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && audioFile.paused && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			this.setTime(newTime);
			audioFile.play();
		}
		if(clipVolume < 0.1) {audioFile.pause();}
	}

	this.getVolume = function() {
		return clipVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceClip = function() {
		return this;
	}

	this.getChildClip = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		this.stop();
		if (clipNumber >= totalClips) {currentClip = 0;}
		else {currentClip = clipNumber;}
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getClipDuration = function(clipNumber) {
		return (times[clipNumber][1] - times[clipNumber][0])
	}

	this.getTimePair = function(clipNumber) {
		return times[clipNumber];
	}

	this.setTime = function(time) {
		audioFile.currentTime = time;
		if (playing) {
			AudioEventManager.addTimerEvent(this, this.getClipDuration(currentClip), "cue");
		}
	}

	this.getTime = function() {
		return audioFile.currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function sfxClipSprite(spriteSheet, clipNumber) {//A referance to the clips in sfxClipSpriteSheet
	var spriteFile = spriteSheet;
	var clip = clipNumber;
	this.name = "sfxClipSprite " + spriteFile.name;
	var duration = spriteFile.getClipDuration(clip);
	var tick = 0;

	this.play = function() {
		spriteFile.setCurrentClip(clip);
		spriteFile.play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.resume();
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
		}
	}

	this.updateVolume = function() {
		spriteFile.updateVolume();		
	}

	this.setVolume = function(newVolume) {
		spriteFile.setVolume(newVolume);
	}

	this.getVolume = function() {
		return spriteFile.getVolume();
	}

	this.getSourceClip = function() {
		return audioFile.getSourceClip();
	}

	this.getChildClip = function() {
		return [audioFile];
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		spriteFile.setTime(time + spriteFile.getTimePair(clip)[0]);
		if (!spriteFile.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return spriteFile.getTime() - spriteFile.getTimePair(clip)[0];
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return spriteFile.getPaused();
	}

	return this;
}

function sfxContainer(clipList) {//Basic Container
	var audioFile = [];
	var currentClip = 0;
	this.name = "sfxContainer";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioFile[i] = clipList[i];
	}

	this.play = function() {
		audioFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in audioFile) {
			audioFile[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioFile[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in audioFile) {
			audioFile[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		audioFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in audioFile) {
			audioFile[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in audioFile) {
			audioFile[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioFile[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return audioFile[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return audioFile;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return audioFile.length;
	}

	this.setTime = function(time) {
		audioFile[currentClip].setTime(time);
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return audioFile[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerLoop(clipList) {//Basic Container
	var audioFile = [];
	var currentClip = 0;
	this.name = "sfxContainer";
	var schedualedClip = 0;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioFile[i] = clipList[i];
	}

	this.play = function() {
		currentClip = schedualedClip;
		audioFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in audioFile) {
			audioFile[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioFile[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in audioFile) {
			audioFile[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			this.play();
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		audioFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in audioFile) {
			audioFile[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in audioFile) {
			audioFile[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioFile[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return audioFile[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return audioFile;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return audioFile.length;
	}

	this.setTime = function(time) {
		audioFile[currentClip].setTime(time);
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return audioFile[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerRandom(clipList) {//Plays a random list-item on playback
	var audioFile = [];
	var currentClip = 0;
	this.name = "sfxContainerRandom";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioFile[i] = clipList[i];
	}

	this.play = function() {
		currentClip = Math.floor(Math.random() * audioFile.length);
		audioFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in audioFile) {
			audioFile[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioFile[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in audioFile) {
			audioFile[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		audioFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in audioFile) {
			audioFile[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in audioFile) {
			audioFile[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioFile[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return audioFile[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return audioFile;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return audioFile.length;
	}

	this.setTime = function(time) {
		audioFile[currentClip].setTime(time);
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return audioFile[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerLoopRandom(clipList) {//Plays a random list-item on playback
	var audioFile = [];
	var currentClip = 0;
	this.name = "sfxContainerRandom";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioFile[i] = clipList[i];
	}

	this.play = function() {
		currentClip = Math.floor(Math.random() * audioFile.length);
		audioFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in audioFile) {
			audioFile[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioFile[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in audioFile) {
			audioFile[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			this.play();
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		audioFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in audioFile) {
			audioFile[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in audioFile) {
			audioFile[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioFile[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return audioFile[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return audioFile;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return audioFile.length;
	}

	this.setTime = function(time) {
		audioFile[currentClip].setTime(time);
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return audioFile[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerLayer(clipList) {//Plays all list-items together
	var audioFile = [];
	var currentClip = 0;
	this.name = "sfxContainerLayer";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioFile[i] = clipList[i];
	}

	this.play = function() {
		for (var i in audioFile) {
			audioFile[i].play();
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in audioFile) {
			audioFile[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		for (var i in audioFile) {
			audioFile[i].resume();
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in audioFile) {
			audioFile[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
		}
	}

	this.setLayerLevel = function(slot, level) {
		audioFile[slot].setVolume(level);
	}

	this.loadClip = function(newClip, slot) {
		audioFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in audioFile) {
			audioFile[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in audioFile) {
			audioFile[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioFile[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return audioFile[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return audioFile;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return audioFile.length;
	}

	this.setTime = function(time) {
		for (var i in audioFile) {
			audioFile[currentClip].setTime(time);
		}
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return audioFile[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerBlend(clipList, startingLevel = 0) {//Container which blends between the volumes of list-items
	var audioFile = [];
	var currentClip = 0;
	this.name = "sfxContainerBlend";
	var currentLevel = startingLevel;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioFile[i] = clipList[i];
	}

	var overlap = 1/audioFile.length - 1;
	function defineVolumes() {
		for (var i = 0; audioFile.length; i++) {
			var relativeLevel = Math.abs(currentLevel - i*overlap);
			if (relativeLevel > overlap) {
				audioFile[i].setVolume(0);
			}
			if (relativeLevel <= overlap) {
				audioFile[i].setVolume(Math.abs(1 - relativeLevel / overlap) * clipVolume);
			}
		}
	}

	this.play = function() {
		defineVolumes();
		for (var i in audioFile) {
			audioFile[i].play();
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in audioFile) {
			audioFile[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		defineVolumes();
		for (var i in audioFile) {
			audioFile[i].resume();
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in audioFile) {
			audioFile[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
		}
	}

	this.setLevel = function(newLevel) {
		currentLevel = newLevel;
		defineVolumes();		
	}

	this.loadClip = function(newClip, slot) {
		audioFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in audioFile) {
			audioFile[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		defineVolumes();
	}

	this.getVolume = function() {
		return audioFile[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return audioFile[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return audioFile;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return audioFile.length;
	}

	this.setTime = function(time) {
		for (var i in audioFile) {
			audioFile[currentClip].setTime(time);
		}
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		return audioFile[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioFile[currentClip].getPaused();
	}

	return this;
}

//Music Classes
MusicVolumeManager = new volumeManager();

function musicTrack(filename, playLength) {//Single buffer music file
	var audioFile = new Audio(audioPath+filename+audioFormat());
	audioFile.onerror = function(){audioFile = new Audio(audioPath+filename+audioFormat(true))};
	var duration = audioFile.duration;
	this.name = filename;
	var duration = playLength;
	var clipVolume = 1;
	var mixVolume = 1;
	var tick = 0;
	var playing = false;

	audioFile.pause();
	audioFile.loop = false;
	var man = MusicVolumeManager;
	man.addToList(this);

	this.play = function() {
		audioFile.currentTime = 0;
		this.updateVolume();
		if (clipVolume > 0.1) {audioFile.play();};
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		playing = true;
	}

	this.stop = function() {
		audioFile.pause();
		audioFile.currentTime = 0;
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.resume = function() {
		if (clipVolume > 0.1) {audioFile.play();};
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile.paused && clipVolume < 0.1) {
			audioFile.currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
		} else {audioFile.pause();}
		audioFile.pause();
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.playFrom = function(time) {
		this.setTime(time);
		audioFile.play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && audioFile.paused && newVolume >= 0.1) {
			var newTime = AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			if(newTime != "none") {
				this.setTime(duration - newTime);
				audioFile.play();
			}
		}
		if(clipVolume < 0.1) {audioFile.pause();}
	}

	this.getVolume = function() {
		return clipVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceTrack = function() {
		return this;
	}

	this.getChildTracks = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time;
		while(newTime >= duration) {newTime -= duration;}
		if(newTime < 0) {newTime = 0;}
		audioFile.currentTime = newTime;
		if(this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return audioFile.currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function musicTrackOverlap(filename, playLength) {//Double buffer music file
	var audioFile = new Array(new Audio(audioPath+filename+audioFormat()), new Audio(audioPath+filename+audioFormat()));
	audioFile[0].onerror = function(){audioFile[0] = new Audio(audioPath+filename+audioFormat(true))}
	audioFile[1].onerror = function(){audioFile[1] = new Audio(audioPath+filename+audioFormat(true))}
	var currentClip = 0;
	var duration = playLength;
	this.name = filename;
	var clipVolume = 1;
	var mixVolume = 1;
	var tick = 0;
	var playing = false;

	audioFile[0].pause();
	audioFile[1].pause();
	var man = MusicVolumeManager;
	man.addToList(this);

	this.play = function() {
		currentClip++;
		if (currentClip > 1) {currentClip = 0;}
		audioFile[currentClip].currentTime = 0;
		this.updateVolume();
		if (clipVolume > 0.1) {audioFile[currentClip].play();};
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		playing = true;
	}

	this.stop = function() {
		audioFile[0].pause();
		audioFile[0].currentTime = 0;
		audioFile[1].pause();
		audioFile[1].currentTime = 0;
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.resume = function() {
		if (clipVolume > 0.1) {audioFile[currentClip].play();};
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile[0].paused && audioFile[1].paused && clipVolume < 0.1) {
			audioFile[currentClip].currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
		} else {
			audioFile[0].pause();
			audioFile[1].pause();
		}
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.playFrom = function(time) {
		this.setTime(time);
		audioFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile[0].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		audioFile[1].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile[0].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		audioFile[1].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && audioFile[currentClip].paused && newVolume >= 0.1) {
			var newTime = AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			if(newTime != "none") {
				this.setTime(duration - newTime);
				audioFile[currentClip].play();
			}
		}
		if(clipVolume < 0.1) {
			audioFile[0].pause();
			audioFile[1].pause();
		}
	}

	this.getVolume = function() {
		return clipVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceTrack = function() {
		return this;
	}

	this.getChildTracks = function() {
		return false;
	}

	this.getSourceFile = function() {
		return audioFile[1];
	} // temp

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time;
		while (newTime >= duration) {newTime -= duration;}
		if(newTime < 0) {newTime = 0;}
		audioFile[currentClip].currentTime = newTime;
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return audioFile[currentClip].currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function musicTrackOverlapLoop(filename, playLength) {//Double buffer music file that loops
	var audioFile = new Array(new Audio(audioPath+filename+audioFormat()), new Audio(audioPath+filename+audioFormat()));
	audioFile[0].onerror = function(){audioFile[0] = new Audio(audioPath+filename+audioFormat(true))}
	audioFile[1].onerror = function(){audioFile[1] = new Audio(audioPath+filename+audioFormat(true))}
	var currentClip = 0;
	var duration = playLength;
	this.name = filename;
	var clipVolume = 1;
	var mixVolume = 1;
	var tick = 0;
	var playing = false;

	audioFile[0].pause();
	audioFile[1].pause();
	var man = MusicVolumeManager;
	man.addToList(this);

	this.play = function() {
		audioFile[currentClip].currentTime = 0;
		this.updateVolume();
		if (clipVolume > 0.1) {audioFile[currentClip].play();};
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		playing = true;
	}

	this.stop = function() {
		audioFile[0].pause();
		audioFile[0].currentTime = 0;
		audioFile[1].pause();
		audioFile[1].currentTime = 0;
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.resume = function() {
		if (clipVolume > 0.1) {audioFile[currentClip].play();};
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile[0].paused && audioFile[1].paused && clipVolume < 0.1) {
			audioFile[currentClip].currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
		} else {
			audioFile[0].pause();
			audioFile[1].pause();
		}
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.playFrom = function(time) {
		this.setTime(time);
		audioFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		playing = true;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentClip++;
			if (currentClip > 1) {currentClip = 0;}
			this.play();
			tick++;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile[0].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		audioFile[1].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile[0].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		audioFile[1].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && audioFile[currentClip].paused && newVolume >= 0.1) {
			var newTime = AudioEventManager.getEventSecondsRemaining(this, TIMER, "cue");
			if(newTime != "none") {
				this.setTime(duration - newTime);
				audioFile[currentClip].play();
			}
		}
		if(clipVolume < 0.1) {
			audioFile[0].pause();
			audioFile[1].pause();
		}
	}

	this.getVolume = function() {
		return clipVolume * !man.getMuted();
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceTrack = function() {
		return this;
	}

	this.getChildTracks = function() {
		return false;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time;
		while (newTime >= duration) {newTime -= duration;}
		if(newTime < 0) {newTime = 0;}
		audioFile[currentClip].currentTime = newTime;
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return audioFile[currentClip].currentTime;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function musicContainer(trackList) {//Basic containers
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainer";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		AudioEventManager.removeTimerEvent(this);
		}
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		AudioEventManager.removeTimerEvent(this);
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {tick++;}
	}

	this.setcurrentClip = function(trackNumber) {
		currentClip = trackNumber;
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerRandom(trackList) {//Picks random list-item to play on play
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerRandom";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		currentClip = Math.floor(Math.random() * musicTrack.length);
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		currentClip = Math.floor(Math.random() * musicTrack.length);
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {tick++;}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerLoop(trackList) {//Loops current list-item
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerLoop";
	var schedualedTrack = 0;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		currentClip = schedualedTrack;
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (callSign == "cue") {
			this.play();
			tick++;
		}
	}

	this.setcurrentClip = function(trackNumber) {
		schedualedTrack = trackNumber;
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerLoopRandom(trackList) {//Picks new random list-item to play every loop
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerLoopRandom";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentClip = Math.floor(Math.random() * musicTrack.length);
			this.play();
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerLoopRandomRepetitionControl(trackList, maxRepetitions = 3, minRepetitions = 1) {//Picks new random list-item to play every loop
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerLoopRandomRepetitionControl";
	var lastTrack = 0;
	var playCountdown = 0;
	var playMax = maxRepetitions;
	var playMin = minRepetitions;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		lastTrack = currentClip;
		playCountdown--;
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (playCountdown <= 0 && musicTrack.length > 1){
				while(currentClip == lastTrack) {
					currentClip = Math.floor(Math.random() * musicTrack.length);
				}
				playCountdown = Math.floor(Math.random() * (playMax - playMin + 1) + playMin);
			}
			this.play();
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerLoopRandomDurationControl(trackList, maxDurationInSeconds = 180, minDurationInSeconds = 60) {//Picks new random list-item to play every loop
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerLoopRandomDurationControl";
	var lastTrack = 0;
	var playTime = 0;
	var playMax = maxDurationInSeconds;
	var playMin = minDurationInSeconds;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
		lastTrack = currentClip;
		playTime += musicTrack[currentClip].getDuration();
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (playTime > playMin && musicTrack.length > 1){
				if(Math.random() <= (playTime - playMin)/(playMax - playMin)) {
					while(currentClip == lastTrack) {
						currentClip = Math.floor(Math.random() * musicTrack.length);
					}
					playTime = 0;
				}
			}
			this.play();
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerConcatenated(trackList) {//Reports all list-items as one item and plays through them
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerConcatenated";
	var duration = 0;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		duration += musicTrack[i].getDuration();
	}


	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, musicTrack[currentClip].getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		currentClip = 0;
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		var totalTime = time;
		var notFound = true;
		for (var i in musicTrack) {
			if (musicTrack[i].getDuration() > totalTime && notFound) {
				totalTime -= musicTrack[i].getDuration();
			} else if (musicTrack[i].getDuration() <= totalTime && notFound) {
				currentClip = i;
				notFound = false;
			}
		}
		musicTrack[currentClip].playFrom(totalTime);
		AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentClip++;
			if (currentClip < musicTrack.length) {
				this.play();
			} else {
				currentClip = 0;
				tick++;
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var totalTime = time;
		for (var i in musicTrack) {
			if (musicTrack[i].getDuration() > totalTime) {
				totalTime -= musicTrack[i].getDuration();
			} else if (musicTrack[i].getDuration() <= totalTime) {
				currentClip = i;
				musicTrack[currentClip].setTime(totalTime);
				return;
			}
		}
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");}
	}

	this.getTime = function() {
		var totalTime = 0;
		for (var i in musicTrack) {
			if (i < currentClip) {
				totalTime += musicTrack[i].getDuration();
			} else if (i == currentClip) {
				totalTime += musicTrack[i].getTime();
			}
		}
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerConcatenatedLatchLast(trackList) {//Reports all list-items as one item, but only repeats last one
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerConcatenatedLatchLast";
	var duration = 0;
	var atEnd = false;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		duration += musicTrack[i].getDuration();
	}


	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, musicTrack[currentClip].getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		if (!atEnd) {
			currentClip = 0;
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		if (atEnd) {
			musicTrack[currentClip].playFrom(time);
			AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
		} else {
			var totalTime = time;
			var notFound = true;
			for (var i in musicTrack) {
				if (musicTrack[i].getDuration() > totalTime && notFound) {
					totalTime -= musicTrack[i].getDuration();
				} else if (musicTrack[i].getDuration() <= totalTime && notFound) {
					currentClip = i;
					notFound = false;
				}
			}
			musicTrack[currentClip].playFrom(totalTime);
			AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
		}
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (currentClip < musicTrack.length - 1) {
				currentClip++;
				this.play()
			} 
			if (currentClip >= musicTrack.length - 1) {
				atEnd = true;
				tick++;
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
		atEnd = false;
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		if (atEnd) {
			musicTrack[currentClip].setTime(time);
			if(!this.getPaused()) {
				AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
			}
		} else {
			var totalTime = time;
			for (var i in musicTrack) {
				if (musicTrack[i].getDuration() > totalTime) {
					totalTime -= musicTrack[i].getDuration();
				} else if (musicTrack[i].getDuration() <= totalTime) {
					currentClip = i;
					musicTrack[currentClip].setTime(totalTime);
					if(!this.getPaused()) {
						AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
					}
					return;
				}
			}
		}
	}

	this.getTime = function() {
		var totalTime = 0;
		if (atEnd) {
			totalTime = musicTrack[currentClip].getTime();
		} else {
			for (var i in musicTrack) {
				if (i < currentClip) {
					totalTime += musicTrack[i].getDuration();
				} else if (i == currentClip) {
					totalTime += musicTrack[i].getTime();
				}
			}
		}
		return totalTime;
	}
	
	this.getDuration = function() {
		if (atEnd) {
			return musicTrack[currentClip].getDuration();
		} else {
			return duration;
		}
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerConcatenatedLoop(trackList) {//Loops list-items as if one item
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerConcatenatedLoop";
	var duration = 0;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		duration += musicTrack[i].getDuration();
	}


	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, musicTrack[currentClip].getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		currentClip = 0;
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		var totalTime = time;
		var notFound = true;
		for (var i in musicTrack) {
			if (musicTrack[i].getDuration() > totalTime && notFound) {
				totalTime -= musicTrack[i].getDuration();
			} else if (musicTrack[i].getDuration() <= totalTime && notFound) {
				currentClip = i;
				notFound = false;
			}
		}
		musicTrack[currentClip].playFrom(totalTime);
		AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentClip++;
			if (currentClip < musicTrack.length) {
				this.play();
			} else {
				currentClip = 0;
				this.play();
				tick++;
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var totalTime = time;
		for (var i in musicTrack) {
			if (musicTrack[i].getDuration() > totalTime) {
				totalTime -= musicTrack[i].getDuration();
			} else if (musicTrack[i].getDuration() <= totalTime) {
				currentClip = i;
				musicTrack[currentClip].setTime(totalTime);
				if(!this.getPaused()) {
					AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
				}
				return;
			}
		}
	}

	this.getTime = function() {
		var totalTime = 0;
		for (var i in musicTrack) {
			if (i < currentClip) {
				totalTime += musicTrack[i].getDuration();
			} else if (i == currentClip) {
				totalTime += musicTrack[i].getTime();
			}
		}
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerConcatenatedLoopLast(trackList) {//Loop all list-items as one item, but only repeats last one
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerConcatenatedLoopLast";
	var duration = 0;
	var atEnd = false;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		duration += musicTrack[i].getDuration();
	}


	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, musicTrack[currentClip].getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		if (!atEnd) {
			currentClip = 0;
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		if (atEnd) {
			musicTrack[currentClip].playFrom(time);
			AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
		} else {
			var totalTime = time;
			var notFound = true;
			for (var i in musicTrack) {
				if (musicTrack[i].getDuration() > totalTime && notFound) {
					totalTime -= musicTrack[i].getDuration();
				} else if (musicTrack[i].getDuration() <= totalTime && notFound) {
					currentClip = i;
					notFound = false;
				}
			}
			musicTrack[currentClip].playFrom(totalTime);
			AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
		}
	}

	this.trigger = function(callSign) {
		if(callSign == "secret cue") {
			if (currentClip < musicTrack.length - 1) {
				currentClip++;
			} 
			if (currentClip >= musicTrack.length - 1) {
				atEnd = true;
				tick++;
			}
			this.play();
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
		atEnd = false;
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		if (atEnd) {
			musicTrack[currentClip].setTime(time);
		} else {
			var totalTime = time;
			for (var i in musicTrack) {
				if (musicTrack[i].getDuration() > totalTime) {
					totalTime -= musicTrack[i].getDuration();
				} else if (musicTrack[i].getDuration() <= totalTime) {
					currentClip = i;
					musicTrack[currentClip].setTime(totalTime);
					if(!this.getPaused()) {
						AudioEventManager.addTimerEvent(this, (musicTrack[currentClip].getDuration() - musicTrack[currentClip].getTime()), "cue");
					}
					return;
				}
			}
		}
	}

	this.getTime = function() {
		var totalTime = 0;
		if (atEnd) {
			totalTime = musicTrack[currentClip].getTime();
		} else {
			for (var i in musicTrack) {
				if (i < currentClip) {
					totalTime += musicTrack[i].getDuration();
				} else if (i == currentClip) {
					totalTime += musicTrack[i].getTime();
				}
			}
		}
		return totalTime;
	}
	
	this.getDuration = function() {
		if (atEnd) {
			return musicTrack[currentClip].getDuration();
		} else {
			return duration;
		}
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerCrossfade(trackList) {//Can crossfade between list-items
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerCrossfade";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].setVolume(0)
	}
	musicTrack[0].setVolume(1);

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {tick++;}
	}

	this.switchTo = function(slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip != slot && !musicTrack[currentClip].getPaused()) {
			musicTrack[slot].playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(musicTrack[slot], fadeTime, clipVolume);
			currentClip = slot;
		} else if (currentClip != slot) {
			musicTrack[slot].setTime(timeNow);
			musicTrack[currentClip].stop();
			currentClip = slot;
			musicTrack[currentClip].setVolume(clipVolume);
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerCrossfadeLoop(trackList) {//Can crossfade between list-items, loops current item
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerCrossfadeLoop";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].setVolume(0)
	}
	musicTrack[0].setVolume(1);

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (callSign == "cue") {
			this.play();
			tick++;
		}
	}

	this.switchTo = function(slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip != slot && !musicTrack[currentClip].getPaused()) {
			musicTrack[slot].playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(musicTrack[slot], fadeTime, clipVolume);
			currentClip = slot;
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		} else if (currentClip != slot) {
			musicTrack[slot].setTime(timeNow);
			musicTrack[currentClip].stop();
			currentClip = slot;
			musicTrack[currentClip].setVolume(clipVolume);
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerLayers(trackList) {//Plays all list-items together, controls volumes
	var musicTrack = [];
	var musicclipVolume = [];
	var clipVolume = 1;
	var currentClip = 0;
	this.name = "musicContainerLayers";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicclipVolume[i] = 1;
		musicTrack[i].setVolume(1);
	}

	function evaluatecurrentClip(){
		var trackNow = 0;
		for(var i = musicTrack.length-1; i >= 0; i--) {
			if (!musicTrack[i].getPaused()) {
				trackNow = i;
			}
		}
		currentClip = trackNow;
	}

	this.play = function() {
		for (var i in musicTrack) {
			if (musicclipVolume[i] > 0) {
				musicTrack[i].play();
			}
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		for (var i in musicTrack) {
			if (musicclipVolume[i] > 0) {
				musicTrack[i].resume();
			}
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		for (var i in musicTrack) {
			musicTrack[i].playFrom(time);
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {tick++;}
	}

	this.setLayerLevel = function(slot, level, fadeTime = 1) {
		musicclipVolume[slot] = level;
		if (musicTrack[slot].getPaused()) {
			var timeNow = musicTrack[0].getTime();
			var tracksPlaying = 0;
			for(var i in musicTrack) {
				if (!musicTrack[i].getPaused()) {
					timeNow = musicTrack[i].getTime();
					tracksPlaying++;
				}
			}
			if (tracksPlaying > 0) {
				musicTrack[slot].setVolume(musicclipVolume[slot] * clipVolume);
				musicTrack[slot].playFrom(timeNow);
			} else {
				musicTrack[slot].setVolume(musicclipVolume[slot] * clipVolume);
			}
		} else {
			AudioEventManager.addFadeEvent(musicTrack[slot], fadeTime, musicclipVolume[slot] * clipVolume);
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack.getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicclipVolume[slot] * clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicclipVolume[slot] * clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) { //Needs a look
		evaluatecurrentClip();
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[slot], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, musicclipVolume[slot] *  clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicclipVolume[slot] * clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
		musicclipVolume.push(0);
		newTrack.setVolume(0);
	}

	this.removeTrack = function(slot) {
		evaluatecurrentClip();
		musicTrack.splice(slot,1);
		musicclipVolume.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (var i in musicTrack) {
			musicTrack[i].setVolume(musicclipVolume[i] * clipVolume);
		}
	}

	this.getVolume = function() {
		evaluatecurrentClip();
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		evaluatecurrentClip();
		 return currentClip;
	}

	this.getSourceTrack = function() {
		evaluatecurrentClip();
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		for (var i in musicTrack) {
			musicTrack[i].setTime(time);
		}
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		evaluatecurrentClip();
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		evaluatecurrentClip();
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		evaluatecurrentClip();
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerLayersLoop(trackList) {//Plays all list-items together, controls volumes, loops
	var musicTrack = [];
	var musicclipVolume = [];
	var clipVolume = 1;
	var currentClip = 0;
	this.name = "musicContainerLayersLoop";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicclipVolume[i] = 1;
		musicTrack[i].setVolume(1);
	}

	function evaluatecurrentClip(){
		var trackNow = 0;
		for(var i = musicTrack.length-1; i >= 0; i--) {
			if (!musicTrack[i].getPaused()) {
				trackNow = i;
			}
		}
		currentClip = trackNow;
	}

	function tracksToPlay() {
		for(var i in musicclipVolume) {
			if(musicclipVolume[i] > 0) {
				return true;
			}
		}
		return false;
	}

	this.play = function() {
		for (var i in musicTrack) {
			if (musicclipVolume[i] > 0) {
				musicTrack[i].play();
			}
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		for (var i in musicTrack) {
			if (musicclipVolume[i] > 0) {
				musicTrack[i].resume();
			}
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		for (var i in musicTrack) {
			musicTrack[i].playFrom(time);
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			this.play();
		}
	}

	this.setLayerLevel = function(slot, level, fadeTime = 1) {
		musicclipVolume[slot] = level;
		if (musicTrack[slot].getPaused()) {
			var timeNow = musicTrack[0].getTime();
			var tracksPlaying = 0;
			for(var i in musicTrack) {
				if (!musicTrack[i].getPaused()) {
					timeNow = musicTrack[i].getTime();
					tracksPlaying++;
				}
			}
			if (tracksPlaying > 0) {
				musicTrack[slot].setVolume(musicclipVolume[slot] * clipVolume);
				musicTrack[slot].playFrom(timeNow);
			} else {
				musicTrack[slot].setVolume(musicclipVolume[slot] * clipVolume);
			}
		} else {
			AudioEventManager.addFadeEvent(musicTrack[slot], fadeTime, musicclipVolume[slot] * clipVolume);
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack.getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicclipVolume[slot] * clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicclipVolume[slot] * clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) { //Needs a look
		evaluatecurrentClip();
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[slot], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, musicclipVolume[slot] *  clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicclipVolume[slot] * clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
		musicclipVolume.push(0);
		newTrack.setVolume(0);
	}

	this.removeTrack = function(slot) {
		evaluatecurrentClip();
		musicTrack.splice(slot,1);
		musicclipVolume.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (var i in musicTrack) {
			musicTrack[i].setVolume(musicclipVolume[i] * clipVolume);
		}
	}

	this.getVolume = function() {
		evaluatecurrentClip();
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		evaluatecurrentClip();
		 return currentClip;
	}

	this.getSourceTrack = function() {
		evaluatecurrentClip();
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		for (var i in musicTrack) {
			musicTrack[i].setTime(time);
		}
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		}
	}

	this.getTime = function() {
		evaluatecurrentClip();
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		evaluatecurrentClip();
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		evaluatecurrentClip();
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerSequence(trackList) {//Plays list-items in order
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerSequence";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentClip++;
			if (currentClip >= musicTrack.length) {
				currentClip = 0;
			}
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerSequenceLatch(trackList) {//Plays list-items in order, but stays on current one until indicated
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerSequenceLatch";
	var latched = true;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.continue = function() {
		latched = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (!latched) {
				currentClip++;
				latched = true;
			}
			if (currentClip >= musicTrack.length) {currentClip = 0;}
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerSequenceLatchLast(trackList) {//Plays list-items in order, stays on last item
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerSequenceLatchLast";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (currentClip < musicTrack.length - 1) {
				currentClip++;
			}
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerPlaylist(trackList) {//Plays through list-items in order
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerPlaylist";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	var clipVolume = 1;

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentClip++;
			if (currentClip < musicTrack.length) {
				this.play();
			} else {
				currentClip = 0;
			}
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerPlaylistLoop(trackList) {//Loops through list-items in order
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerPlaylistLoop";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentClip++;
			if (currentClip >= musicTrack.length) {currentClip = 0;}
			this.play();
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerPlaylistLoopLatch(trackList) {//Plays through list-items in order, but loops current one until indicated
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerPlaylistLoopLatch";
	var latched = true;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.continue = function() {
		latched = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (!latched) {
				currentClip++;
				latched = true;
			}
			if (currentClip >= musicTrack.length) {currentClip = 0;}
			this.play();
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}

function musicContainerPlaylistLoopLast(trackList) {//Plays through list-items in order, loops last item
	var musicTrack = [];
	var currentClip = 0;
	this.name = "musicContainerPlaylistLoopLast";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
	}

	this.play = function() {
		musicTrack[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		musicTrack[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		musicTrack[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			if (currentClip < musicTrack.length - 1) {
				currentClip++;
			}
			this.play();
			tick++;
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentClip].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentClip].getTime();
		if(currentClip == slot && !musicTrack[currentClip].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, clipVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(clipVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in musicTrack) {
			musicTrack[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return musicTrack[currentClip].getVolume();
	}

	this.getcurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentClip].getSourceTrack();
	}

	this.getChildTracks = function() {
		return musicTrack;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		musicTrack[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");}
	}

	this.getTime = function() {
		return musicTrack[currentClip].getTime();
	}	
	this.getDuration = function() {
		return musicTrack[currentClip].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentClip].getPaused();
	}

	return this;
}
