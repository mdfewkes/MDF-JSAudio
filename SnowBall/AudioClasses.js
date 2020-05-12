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

//---//---General
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

//---//---SFX Classes
SFXVolumeManager = new volumeManager();

function sfxClip(filename) {//A simple, single buffer sound clip
	var audioFile = new Audio(audioPath+filename+audioFormat());
	audioFile.onerror = function(){audioFile = new Audio(audioPath+filename+audioFormat(true))};
	var clipVolume = 1;
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
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
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
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile.paused && clipVolume < 0.1) {
			audioFile.currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {audioFile.pause();}
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && audioFile.paused && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(newTime);
			audioFile.play();
		}
		if(clipVolume < 0.1) {audioFile.pause();}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		this.updateVolume();
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
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
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
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
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
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile[currentClip].paused && clipVolume < 0.1) {
			audioFile[currentClip].currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {audioFile.pause();}

		for (var i in audioFile) {
			audioFile[i].pause();
		}
		playing = false;
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		for (var i in audioFile) {
			audioFile[i].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		}
		if(playing && audioFile[currentClip].paused && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(newTime);
			audioFile[currentClip].play();
		}
		if(clipVolume < 0.1) {
			audioFile[0].pause();
			audioFile[1].pause();
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		this.updateVolume();
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
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
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
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
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
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile[0].paused && audioFile[1].paused && clipVolume < 0.1) {
			audioFile[currentClip].currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {
			audioFile[0].pause();
			audioFile[1].pause();
		}
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
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
		if(playing && audioFile[currentClip].paused && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(newTime);
			audioFile[currentClip].play();
		}
		if(clipVolume < 0.1) {
			audioFile[0].pause();
			audioFile[1].pause();
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		this.updateVolume();
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
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
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
		AudioEventManager.addTimerEvent(this, this.getClipDuration(currentClip), "tick");
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
		AudioEventManager.addTimerEvent(this, (this.getClipDuration(currentClip) - (times[currentClip][1] - this.getTime())), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile.paused && clipVolume < 0.1) {
			audioFile.currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {audioFile.pause();}
		AudioEventManager.removeStopEvent(this);
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && audioFile.paused && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(newTime);
			audioFile.play();
		}
		if(clipVolume < 0.1) {audioFile.pause();}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		this.updateVolume();
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
			AudioEventManager.addTimerEvent(this, this.getClipDuration(currentClip), "tick");
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
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
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
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
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
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
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
	var audioClip = [];
	var currentClip = 0;
	this.name = "sfxContainer";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		audioClip[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return audioClip;
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
		 return audioClip.length;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function sfxContainerLoop(clipList) {//Basic Container
	var audioClip = [];
	var currentClip = 0;
	this.name = "sfxContainer";
	var schedualedClip = 0;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		currentClip = schedualedClip;
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			this.play();
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		audioClip[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return audioClip;
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
		 return audioClip.length;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function sfxContainerRandom(clipList) {//Plays a random list-item on playback
	var audioClip = [];
	var currentClip = 0;
	this.name = "sfxContainerRandom";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		currentClip = Math.floor(Math.random() * audioClip.length);
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		audioClip[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return audioClip;
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
		 return audioClip.length;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function sfxContainerLoopRandom(clipList) {//Plays a random list-item on playback
	var audioClip = [];
	var currentClip = 0;
	this.name = "sfxContainerRandom";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		currentClip = Math.floor(Math.random() * audioClip.length);
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			this.play();
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		audioClip[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return audioClip;
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
		 return audioClip.length;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function sfxContainerLayer(clipList) {//Plays all list-items together
	var audioClip = [];
	var currentClip = 0;
	this.name = "sfxContainerLayer";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		for (var i in audioClip) {
			audioClip[i].play();
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		for (var i in audioClip) {
			audioClip[i].resume();
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
		}
	}

	this.setLayerLevel = function(slot, level) {
		audioClip[slot].setVolume(level);
	}

	this.loadClip = function(newClip, slot) {
		audioClip[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return audioClip;
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
		 return audioClip.length;
	}

	this.setTime = function(time) {
		for (var i in audioClip) {
			audioClip[currentClip].setTime(time);
		}
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function sfxContainerBlend(clipList, startingLevel = 0) {//Container which blends between the volumes of list-items
	var audioClip = [];
	var currentClip = 0;
	this.name = "sfxContainerBlend";
	var currentLevel = startingLevel;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	var overlap = 1/audioClip.length - 1;
	function defineVolumes() {
		for (var i = 0; audioClip.length; i++) {
			var relativeLevel = Math.abs(currentLevel - i*overlap);
			if (relativeLevel > overlap) {
				audioClip[i].setVolume(0);
			}
			if (relativeLevel <= overlap) {
				audioClip[i].setVolume(Math.abs(1 - relativeLevel / overlap) * clipVolume);
			}
		}
	}

	this.play = function() {
		defineVolumes();
		for (var i in audioClip) {
			audioClip[i].play();
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		defineVolumes();
		for (var i in audioClip) {
			audioClip[i].resume();
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
		}
	}

	this.setLevel = function(newLevel) {
		currentLevel = newLevel;
		defineVolumes();		
	}

	this.loadClip = function(newClip, slot) {
		audioClip[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function (newVolume) {
		clipVolume = newVolume;
		defineVolumes();
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClip = function() {
		return audioClip;
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
		 return audioClip.length;
	}

	this.setTime = function(time) {
		for (var i in audioClip) {
			audioClip[currentClip].setTime(time);
		}
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

//---//---Music Classes
MusicVolumeManager = new volumeManager();

function MusicClip(filename, playLength) {//Single buffer music file
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
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
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
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile.paused && clipVolume < 0.1) {
			audioFile.currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {audioFile.pause();}
		audioFile.pause();
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.playFrom = function(time) {
		this.setTime(time);
		audioFile.play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && audioFile.paused && newVolume >= 0.1) {
			var newTime = AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			if(newTime != "none") {
				this.setTime(duration - newTime);
				audioFile.play();
			}
		}
		if(clipVolume < 0.1) {audioFile.pause();}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		this.updateVolume();
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

	this.getChildClips = function() {
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
		if(this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
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

function musicClipOverlap(filename, playLength) {//Double buffer music file
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
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
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
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile[0].paused && audioFile[1].paused && clipVolume < 0.1) {
			audioFile[currentClip].currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
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
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
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
		if(playing && audioFile[currentClip].paused && newVolume >= 0.1) {
			var newTime = AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
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

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		this.updateVolume();
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

	this.getChildClips = function() {
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
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
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

function musicClipOverlapLoop(filename, playLength) {//Double buffer music file that loops
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
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
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
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && audioFile[0].paused && audioFile[1].paused && clipVolume < 0.1) {
			audioFile[currentClip].currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
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
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
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
		if(playing && audioFile[currentClip].paused && newVolume >= 0.1) {
			var newTime = AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
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

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		clipVolume = newVolume;
		this.updateVolume();
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

	this.getChildClips = function() {
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
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
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
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainer";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		AudioEventManager.removeTimerEvent(this);
		}
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		AudioEventManager.removeTimerEvent(this);
		}
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {tick++;}
	}

	this.setCurrentClip = function(trackNumber) {
		currentClip = trackNumber;
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerRandom(trackList) {//Picks random list-item to play on play
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerRandom";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	this.play = function() {
		currentClip = Math.floor(Math.random() * audioClip.length);
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		currentClip = Math.floor(Math.random() * audioClip.length);
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {tick++;}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerLoop(trackList) {//Loops current list-item
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerLoop";
	var schedualedClip = 0;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	this.play = function() {
		currentClip = schedualedClip;
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if (callSign == "tick") {
			this.play();
			tick++;
		}
	}

	this.setCurrentClip = function(trackNumber) {
		schedualedClip = trackNumber;
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerLoopRandom(trackList) {//Picks new random list-item to play every loop
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerLoopRandom";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			currentClip = Math.floor(Math.random() * audioClip.length);
			this.play();
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerLoopRandomRepetitionControl(trackList, maxRepetitions = 3, minRepetitions = 1) {//Picks new random list-item to play every loop
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerLoopRandomRepetitionControl";
	var lastClip = 0;
	var playCountdown = 0;
	var playMax = maxRepetitions;
	var playMin = minRepetitions;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
		lastClip = currentClip;
		playCountdown--;
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			if (playCountdown <= 0 && audioClip.length > 1){
				while(currentClip == lastClip) {
					currentClip = Math.floor(Math.random() * audioClip.length);
				}
				playCountdown = Math.floor(Math.random() * (playMax - playMin + 1) + playMin);
			}
			this.play();
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerLoopRandomDurationControl(trackList, maxDurationInSeconds = 180, minDurationInSeconds = 60) {//Picks new random list-item to play every loop
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerLoopRandomDurationControl";
	var lastClip = 0;
	var playTime = 0;
	var playMax = maxDurationInSeconds;
	var playMin = minDurationInSeconds;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
		lastClip = currentClip;
		playTime += audioClip[currentClip].getDuration();
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			if (playTime > playMin && audioClip.length > 1){
				if(Math.random() <= (playTime - playMin)/(playMax - playMin)) {
					while(currentClip == lastClip) {
						currentClip = Math.floor(Math.random() * audioClip.length);
					}
					playTime = 0;
				}
			}
			this.play();
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerConcatenated(trackList) {//Reports all list-items as one item and plays through them
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerConcatenated";
	var duration = 0;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
		duration += audioClip[i].getDuration();
	}


	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, audioClip[currentClip].getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		currentClip = 0;
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		var totalTime = time;
		var notFound = true;
		for (var i in audioClip) {
			if (audioClip[i].getDuration() > totalTime && notFound) {
				totalTime -= audioClip[i].getDuration();
			} else if (audioClip[i].getDuration() <= totalTime && notFound) {
				currentClip = i;
				notFound = false;
			}
		}
		audioClip[currentClip].playFrom(totalTime);
		AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			currentClip++;
			if (currentClip < audioClip.length) {
				this.play();
			} else {
				currentClip = 0;
				tick++;
			}
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var totalTime = time;
		for (var i in audioClip) {
			if (audioClip[i].getDuration() > totalTime) {
				totalTime -= audioClip[i].getDuration();
			} else if (audioClip[i].getDuration() <= totalTime) {
				currentClip = i;
				audioClip[currentClip].setTime(totalTime);
				return;
			}
		}
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");}
	}

	this.getTime = function() {
		var totalTime = 0;
		for (var i in audioClip) {
			if (i < currentClip) {
				totalTime += audioClip[i].getDuration();
			} else if (i == currentClip) {
				totalTime += audioClip[i].getTime();
			}
		}
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerConcatenatedLatchLast(trackList) {//Reports all list-items as one item, but only repeats last one
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerConcatenatedLatchLast";
	var duration = 0;
	var atEnd = false;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
		duration += audioClip[i].getDuration();
	}


	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, audioClip[currentClip].getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		if (!atEnd) {
			currentClip = 0;
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		if (atEnd) {
			audioClip[currentClip].playFrom(time);
			AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
		} else {
			var totalTime = time;
			var notFound = true;
			for (var i in audioClip) {
				if (audioClip[i].getDuration() > totalTime && notFound) {
					totalTime -= audioClip[i].getDuration();
				} else if (audioClip[i].getDuration() <= totalTime && notFound) {
					currentClip = i;
					notFound = false;
				}
			}
			audioClip[currentClip].playFrom(totalTime);
			AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
		}
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			if (currentClip < audioClip.length - 1) {
				currentClip++;
				this.play()
			} 
			if (currentClip >= audioClip.length - 1) {
				atEnd = true;
				tick++;
			}
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in audioClip) {
			duration += audioClip[i].getDuration();
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in audioClip) {
			duration += audioClip[i].getDuration();
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
		duration = 0;
		for (var i in audioClip) {
			duration += audioClip[i].getDuration();
		}
		atEnd = false;
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}

		duration = 0;
		for (var i in audioClip) {
			duration += audioClip[i].getDuration();
		}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		if (atEnd) {
			audioClip[currentClip].setTime(time);
			if(!this.getPaused()) {
				AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
			}
		} else {
			var totalTime = time;
			for (var i in audioClip) {
				if (audioClip[i].getDuration() > totalTime) {
					totalTime -= audioClip[i].getDuration();
				} else if (audioClip[i].getDuration() <= totalTime) {
					currentClip = i;
					audioClip[currentClip].setTime(totalTime);
					if(!this.getPaused()) {
						AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
					}
					return;
				}
			}
		}
	}

	this.getTime = function() {
		var totalTime = 0;
		if (atEnd) {
			totalTime = audioClip[currentClip].getTime();
		} else {
			for (var i in audioClip) {
				if (i < currentClip) {
					totalTime += audioClip[i].getDuration();
				} else if (i == currentClip) {
					totalTime += audioClip[i].getTime();
				}
			}
		}
		return totalTime;
	}
	
	this.getDuration = function() {
		if (atEnd) {
			return audioClip[currentClip].getDuration();
		} else {
			return duration;
		}
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerConcatenatedLoop(trackList) {//Loops list-items as if one item
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerConcatenatedLoop";
	var duration = 0;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
		duration += audioClip[i].getDuration();
	}


	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, audioClip[currentClip].getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		currentClip = 0;
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		var totalTime = time;
		var notFound = true;
		for (var i in audioClip) {
			if (audioClip[i].getDuration() > totalTime && notFound) {
				totalTime -= audioClip[i].getDuration();
			} else if (audioClip[i].getDuration() <= totalTime && notFound) {
				currentClip = i;
				notFound = false;
			}
		}
		audioClip[currentClip].playFrom(totalTime);
		AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			currentClip++;
			if (currentClip < audioClip.length) {
				this.play();
			} else {
				currentClip = 0;
				this.play();
				tick++;
			}
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var totalTime = time;
		for (var i in audioClip) {
			if (audioClip[i].getDuration() > totalTime) {
				totalTime -= audioClip[i].getDuration();
			} else if (audioClip[i].getDuration() <= totalTime) {
				currentClip = i;
				audioClip[currentClip].setTime(totalTime);
				if(!this.getPaused()) {
					AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
				}
				return;
			}
		}
	}

	this.getTime = function() {
		var totalTime = 0;
		for (var i in audioClip) {
			if (i < currentClip) {
				totalTime += audioClip[i].getDuration();
			} else if (i == currentClip) {
				totalTime += audioClip[i].getTime();
			}
		}
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerConcatenatedLoopLast(trackList) {//Loop all list-items as one item, but only repeats last one
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerConcatenatedLoopLast";
	var duration = 0;
	var atEnd = false;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
		duration += audioClip[i].getDuration();
	}


	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, audioClip[currentClip].getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		if (!atEnd) {
			currentClip = 0;
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		if (atEnd) {
			audioClip[currentClip].playFrom(time);
			AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
		} else {
			var totalTime = time;
			var notFound = true;
			for (var i in audioClip) {
				if (audioClip[i].getDuration() > totalTime && notFound) {
					totalTime -= audioClip[i].getDuration();
				} else if (audioClip[i].getDuration() <= totalTime && notFound) {
					currentClip = i;
					notFound = false;
				}
			}
			audioClip[currentClip].playFrom(totalTime);
			AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
		}
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			if (currentClip < audioClip.length - 1) {
				currentClip++;
			} 
			if (currentClip >= audioClip.length - 1) {
				atEnd = true;
				tick++;
			}
			this.play();
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in audioClip) {
			duration += audioClip[i].getDuration();
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in audioClip) {
			duration += audioClip[i].getDuration();
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
		duration = 0;
		for (var i in audioClip) {
			duration += audioClip[i].getDuration();
		}
		atEnd = false;
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}

		duration = 0;
		for (var i in audioClip) {
			duration += audioClip[i].getDuration();
		}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		if (atEnd) {
			audioClip[currentClip].setTime(time);
		} else {
			var totalTime = time;
			for (var i in audioClip) {
				if (audioClip[i].getDuration() > totalTime) {
					totalTime -= audioClip[i].getDuration();
				} else if (audioClip[i].getDuration() <= totalTime) {
					currentClip = i;
					audioClip[currentClip].setTime(totalTime);
					if(!this.getPaused()) {
						AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
					}
					return;
				}
			}
		}
	}

	this.getTime = function() {
		var totalTime = 0;
		if (atEnd) {
			totalTime = audioClip[currentClip].getTime();
		} else {
			for (var i in audioClip) {
				if (i < currentClip) {
					totalTime += audioClip[i].getDuration();
				} else if (i == currentClip) {
					totalTime += audioClip[i].getTime();
				}
			}
		}
		return totalTime;
	}
	
	this.getDuration = function() {
		if (atEnd) {
			return audioClip[currentClip].getDuration();
		} else {
			return duration;
		}
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerCrossfade(trackList) {//Can crossfade between list-items
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerCrossfade";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
		audioClip[i].setVolume(0)
	}
	audioClip[0].setVolume(1);

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {tick++;}
	}

	this.switchTo = function(slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip != slot && !audioClip[currentClip].getPaused()) {
			audioClip[slot].playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(audioClip[slot], fadeTime, clipVolume);
			currentClip = slot;
		} else if (currentClip != slot) {
			audioClip[slot].setTime(timeNow);
			audioClip[currentClip].stop();
			currentClip = slot;
			audioClip[currentClip].setVolume(clipVolume);
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerCrossfadeLoop(trackList) {//Can crossfade between list-items, loops current item
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerCrossfadeLoop";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
		audioClip[i].setVolume(0)
	}
	audioClip[0].setVolume(1);

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if (callSign == "tick") {
			this.play();
			tick++;
		}
	}

	this.switchTo = function(slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip != slot && !audioClip[currentClip].getPaused()) {
			audioClip[slot].playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(audioClip[slot], fadeTime, clipVolume);
			currentClip = slot;
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		} else if (currentClip != slot) {
			audioClip[slot].setTime(timeNow);
			audioClip[currentClip].stop();
			currentClip = slot;
			audioClip[currentClip].setVolume(clipVolume);
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerLayers(trackList) {//Plays all list-items together, controls volumes
	var audioClip = [];
	var musicClipVolume = [];
	var clipVolume = 1;
	var currentClip = 0;
	this.name = "musicContainerLayers";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
		musicClipVolume[i] = 1;
		audioClip[i].setVolume(1);
	}

	function evaluateCurrentClip(){
		var trackNow = 0;
		for(var i = audioClip.length-1; i >= 0; i--) {
			if (!audioClip[i].getPaused()) {
				trackNow = i;
			}
		}
		currentClip = trackNow;
	}

	this.play = function() {
		for (var i in audioClip) {
			if (musicClipVolume[i] > 0) {
				audioClip[i].play();
			}
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		for (var i in audioClip) {
			if (musicClipVolume[i] > 0) {
				audioClip[i].resume();
			}
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		for (var i in audioClip) {
			audioClip[i].playFrom(time);
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {tick++;}
	}

	this.setLayerLevel = function(slot, level, fadeTime = 1) {
		musicClipVolume[slot] = level;
		if (audioClip[slot].getPaused()) {
			var timeNow = audioClip[0].getTime();
			var tracksPlaying = 0;
			for(var i in audioClip) {
				if (!audioClip[i].getPaused()) {
					timeNow = audioClip[i].getTime();
					tracksPlaying++;
				}
			}
			if (tracksPlaying > 0) {
				audioClip[slot].setVolume(musicClipVolume[slot] * clipVolume);
				audioClip[slot].playFrom(timeNow);
			} else {
				audioClip[slot].setVolume(musicClipVolume[slot] * clipVolume);
			}
		} else {
			AudioEventManager.addFadeEvent(audioClip[slot], fadeTime, musicClipVolume[slot] * clipVolume);
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip.getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(musicClipVolume[slot] * clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(musicClipVolume[slot] * clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) { //Needs a look
		evaluateCurrentClip();
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[slot], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, musicClipVolume[slot] *  clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(musicClipVolume[slot] * clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
		musicClipVolume.push(0);
		newClip.setVolume(0);
	}

	this.removeClip = function(slot) {
		evaluateCurrentClip();
		audioClip.splice(slot,1);
		musicClipVolume.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (var i in audioClip) {
			audioClip[i].setVolume(musicClipVolume[i] * clipVolume);
		}
	}

	this.getVolume = function() {
		evaluateCurrentClip();
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		evaluateCurrentClip();
		 return currentClip;
	}

	this.getSourceClip = function() {
		evaluateCurrentClip();
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		for (var i in audioClip) {
			audioClip[i].setTime(time);
		}
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		evaluateCurrentClip();
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		evaluateCurrentClip();
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		evaluateCurrentClip();
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerLayersLoop(trackList) {//Plays all list-items together, controls volumes, loops
	var audioClip = [];
	var musicClipVolume = [];
	var clipVolume = 1;
	var currentClip = 0;
	this.name = "musicContainerLayersLoop";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
		musicClipVolume[i] = 1;
		audioClip[i].setVolume(1);
	}

	function evaluateCurrentClip(){
		var trackNow = 0;
		for(var i = audioClip.length-1; i >= 0; i--) {
			if (!audioClip[i].getPaused()) {
				trackNow = i;
			}
		}
		currentClip = trackNow;
	}

	function tracksToPlay() {
		for(var i in musicClipVolume) {
			if(musicClipVolume[i] > 0) {
				return true;
			}
		}
		return false;
	}

	this.play = function() {
		for (var i in audioClip) {
			if (musicClipVolume[i] > 0) {
				audioClip[i].play();
			}
		}
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		for (var i in audioClip) {
			if (musicClipVolume[i] > 0) {
				audioClip[i].resume();
			}
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		for (var i in audioClip) {
			audioClip[i].playFrom(time);
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			this.play();
			tick++;
		}
	}

	this.setLayerLevel = function(slot, level, fadeTime = 1) {
		musicClipVolume[slot] = level;
		if (audioClip[slot].getPaused()) {
			var timeNow = audioClip[0].getTime();
			var tracksPlaying = 0;
			for(var i in audioClip) {
				if (!audioClip[i].getPaused()) {
					timeNow = audioClip[i].getTime();
					tracksPlaying++;
				}
			}
			if (tracksPlaying > 0) {
				audioClip[slot].setVolume(musicClipVolume[slot] * clipVolume);
				audioClip[slot].playFrom(timeNow);
			} else {
				audioClip[slot].setVolume(musicClipVolume[slot] * clipVolume);
			}
		} else {
			AudioEventManager.addFadeEvent(audioClip[slot], fadeTime, musicClipVolume[slot] * clipVolume);
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip.getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(musicClipVolume[slot] * clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(musicClipVolume[slot] * clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) { //Needs a look
		evaluateCurrentClip();
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[slot], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, musicClipVolume[slot] *  clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(musicClipVolume[slot] * clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
		musicClipVolume.push(0);
		newClip.setVolume(0);
	}

	this.removeClip = function(slot) {
		evaluateCurrentClip();
		audioClip.splice(slot,1);
		musicClipVolume.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (var i in audioClip) {
			audioClip[i].setVolume(musicClipVolume[i] * clipVolume);
		}
	}

	this.getVolume = function() {
		evaluateCurrentClip();
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		evaluateCurrentClip();
		 return currentClip;
	}

	this.getSourceClip = function() {
		evaluateCurrentClip();
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		for (var i in audioClip) {
			audioClip[i].setTime(time);
		}
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	this.getTime = function() {
		evaluateCurrentClip();
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		evaluateCurrentClip();
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		evaluateCurrentClip();
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerSequence(trackList) {//Plays list-items in order
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerSequence";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			currentClip++;
			if (currentClip >= audioClip.length) {
				currentClip = 0;
			}
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerSequenceLatch(trackList) {//Plays list-items in order, but stays on current one until indicated
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerSequenceLatch";
	var latched = true;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.continue = function() {
		latched = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			if (!latched) {
				currentClip++;
				latched = true;
			}
			if (currentClip >= audioClip.length) {currentClip = 0;}
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerSequenceLatchLast(trackList) {//Plays list-items in order, stays on last item
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerSequenceLatchLast";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			if (currentClip < audioClip.length - 1) {
				currentClip++;
			}
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerPlaylist(trackList) {//Plays through list-items in order
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerPlaylist";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	var clipVolume = 1;

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			currentClip++;
			if (currentClip < audioClip.length) {
				this.play();
			} else {
				currentClip = 0;
			}
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerPlaylistLoop(trackList) {//Loops through list-items in order
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerPlaylistLoop";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			currentClip++;
			if (currentClip >= audioClip.length) {currentClip = 0;}
			this.play();
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerPlaylistLoopLatch(trackList) {//Plays through list-items in order, but loops current one until indicated
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerPlaylistLoopLatch";
	var latched = true;
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.continue = function() {
		latched = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			if (!latched) {
				currentClip++;
				latched = true;
			}
			if (currentClip >= audioClip.length) {currentClip = 0;}
			this.play();
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}

function musicContainerPlaylistLoopLast(trackList) {//Plays through list-items in order, loops last item
	var audioClip = [];
	var currentClip = 0;
	this.name = "musicContainerPlaylistLoopLast";
	var clipVolume = 1;
	var tick = 0;

	for (var i in trackList) {
		audioClip[i] = trackList[i];
	}

	this.play = function() {
		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.resume = function() {
		audioClip[currentClip].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		AudioEventManager.removeTimerEvent(this);
	}

	this.playFrom = function(time) {
		audioClip[currentClip].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			if (currentClip < audioClip.length - 1) {
				currentClip++;
			}
			this.play();
			tick++;
		}
	}

	this.loadClip = function(newClip, slot) {
		var timeNow = audioClip[currentClip].getTime();
		if(!audioClip[slot].getPaused()) {
			audioClip[slot].pause();
			audioClip[slot].setTime(0);
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].playFrom(timeNow);
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.loadClipWithCrossfade = function(newClip, slot, fadeTime = 1) {
		var timeNow = audioClip[currentClip].getTime();
		if(currentClip == slot && !audioClip[currentClip].getPaused()) {
			newClip.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newClip, fadeTime, clipVolume);
			audioClip[slot] = newClip;
		} else {
			audioClip[slot] = newClip;
			audioClip[slot].setVolume(clipVolume);
			audioClip[slot].setTime(timeNow);
		}
	}

	this.addClip = function(newClip) {
		audioClip.push(newClip);
	}

	this.removeClip = function(slot) {
		audioClip.splice(slot,1);
		if (currentClip >= slot) {currentClip--;}
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume);
		}
	}

	this.getVolume = function() {
		return audioClip[currentClip].getVolume();
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.getSourceClip = function() {
		return audioClip[currentClip].getSourceClip();
	}

	this.getChildClips = function() {
		return audioClip;
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		audioClip[currentClip].setTime(time);
		if(!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
	}

	this.getTime = function() {
		return audioClip[currentClip].getTime();
	}	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration();
	}

	this.getPaused = function() {
		return audioClip[currentClip].getPaused();
	}

	return this;
}
