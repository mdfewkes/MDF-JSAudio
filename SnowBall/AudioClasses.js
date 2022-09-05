/*
AudioClasses.js and AudioManager,js are an attemp my Michael Fewkes to make more complex audio behaviors simpler to implement.

Functions that all sound objects share:
.play()    Plays from the beggining of the object
.stop()	    Stops playback and resets playback time
.resume()    Plays object from last playback time
.pause()    Stops playback without resetting playback time
.setVolume()/.getVolume()    Reports and sets object volume (0-1)
.setTime()/.getTime()    Controls the playback time
.getTick()/resetTick)    Gets and resets the number of times the object has played
.getDuration()    Reports the current duration of the object
.getPaused()    Reports true if the object is not currently playing
.getSourceClip()    Returns the lowest level currently active clip
.getChildClips()    Returns a list of objects being managed by the object. returns false for lowest level clips

Clip only:
.setMixLevel()    Sets a volume multiplier, used for relative mixing. Can be larger than 1, but mixLevel * volume will never be greater than 1, before the volume manager is applied
.getAudioFile()    Returns an array of audio files from lowest level clips
//.setAudioManager()    Assigns the clip to an audio manager

Container only:
.setCurrentClip()/.getCurrentClip()    Sets the currentClip pointer for the next play event.

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

	this.removeFromList = function(item) {
		list.splice(list.indexOf(item), 1);
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
}

//---//---SFX Classes
SFXVolumeManager = new volumeManager();

function sfxClip(filename) {//A simple, single buffer sound clip
	var audioFile = new Audio(audioPath+filename+audioFormat());
	audioFile.onerror = function(){audioFile = new Audio(audioPath+filename+audioFormat(true))};
	audioFile.onloadedmetadata = init;
	var clipVolume = 1;
	this.name = filename;
	var duration = 0;
	var mixVolume = 1;
	var playing = false;
	var virtual = false;
	var tick = 0;

	audioFile.pause();
	var man = SFXVolumeManager;
	man.addToList(this);

	function init() {
		duration = audioFile.duration;
	}

	this.play = function() {
		audioFile.currentTime = 0;
		this.resume();
	}

	this.stop = function() {
		playing = false;
		this.pause();
		audioFile.currentTime = 0;
	}

	this.resume = function() {
		this.updateVolume();
		if (clipVolume > 0.1) {
			audioFile.play();
		} else {
			virtual = true;
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && virtual) {
			audioFile.currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {
			audioFile.pause();
		}
		AudioEventManager.removeTimerEvent(this);
		playing = false;
		virtual = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			playing = false;
			virtual = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && virtual && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(newTime);
			audioFile.play();
			virtual = false;
		} else if(clipVolume < 0.1) {
			audioFile.pause();
			virtual = true;
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

	this.getAudioFile = function() {
		var audioArray = new Array(1);
		audioArray[0] = audioFile;
		return audioArray;
	}

	this.setVolumeManager = function(newManager) {
		man.removeFromList(this);
		man = newManager;
		man.addToList(this);
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time % duration;
		if (newTime < 0) {newTime = duration - newTime;}
		audioFile[currentClip].currentTime = newTime;
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

function sfxClipLoop(filename) {// A simple, single buffer sound clip that loops
	var audioFile = new Audio(audioPath+filename+audioFormat());
	audioFile.onerror = function(){audioFile = new Audio(audioPath+filename+audioFormat(true))};
	audioFile.onloadedmetadata = init;
	var clipVolume = 1;
	this.name = filename;
	var duration = 0;
	var mixVolume = 1;
	var playing = false;
	var virtual = false;
	var tick = 0;

	audioFile.pause();
	audioFile.loop = true;
	var man = SFXVolumeManager;
	man.addToList(this);

	function init() {
		duration = audioFile.duration;
	}

	this.play = function() {
		audioFile.currentTime = 0;
		this.resume();
	}

	this.stop = function() {
		playing = false;
		this.pause();
		audioFile.currentTime = 0;
	}

	this.resume = function() {
		this.updateVolume();
		if (clipVolume > 0.1) {
			audioFile.play()
		} else {
			virtual = true;
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && virtual) {
			audioFile.currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {
			audioFile.pause();
		}
		AudioEventManager.removeTimerEvent(this);
		playing = false;
		virtual = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && virtual && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(newTime);
			audioFile.play();
			virtual = false;
		} else if (clipVolume < 0.1) {
			audioFile.pause();
			virtual = true;
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

	this.getAudioFile = function() {
		var audioArray = new Array(1);
		audioArray[0] = audioFile;
		return audioArray;
	}

	this.setVolumeManager = function(newManager) {
		man.removeFromList(this);
		man = newManager;
		man.addToList(this);
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time % duration;
		if (newTime < 0) {newTime = duration - newTime;}
		audioFile[currentClip].currentTime = newTime;
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

function sfxClipOverlap(filename, voices = 2) {// A sound clip with as many buffers as specified
	var audioFile = new Array(voices);
	var maxVoices = audioFile.length;
	for (var i = 0; i < audioFile.length; i++) {
		audioFile[i] = new Audio(audioPath+filename+audioFormat());
		audioFile[i].onerror = function(){audioFile[i] = new Audio(audioPath+filename+audioFormat(true))};
		audioFile[i].pause();
	}
	audioFile[0].onloadeddata = init;
	var currentClip = 0;
	var clipVolume = 1;
	this.name = filename;
	var duration = audioFile[0].duration;
	var mixVolume = 1;
	var playing = false;
	var virtual = false;
	var tick = 0;


	var man = SFXVolumeManager;
	man.addToList(this);


	function init() {
		duration = audioFile[0].duration;
	}

	this.play = function() {
		currentClip = (currentClip + 1) % maxVoices;
		audioFile[currentClip].currentTime = 0;
		this.resume();
	}

	this.stop = function() {
		playing = false;
		this.pause();
		audioFile[currentClip].currentTime = 0;
	}

	this.resume = function() {
		this.updateVolume();
		if (clipVolume > 0.1) {
			audioFile[currentClip].play();
		} else {
			virtual = true;
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && virtual) {
			audioFile[currentClip].currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		}
		for (var i in audioFile) {
			audioFile[i].pause();
		}
		playing = false;
		virtual = false;
		AudioEventManager.removeTimerEvent(this);
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			playing = false;
			virtual = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		for (var i in audioFile) {
			audioFile[i].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		}
		if(playing && virtual && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(newTime);
			audioFile[currentClip].play();
			virtual = false;
		}
		if(clipVolume < 0.1) {
			audioFile[0].pause();
			audioFile[1].pause();
			virtual = true;
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

	this.getAudioFile = function() {
		return audioFile;
	}

	this.setVolumeManager = function(newManager) {
		man.removeFromList(this);
		man = newManager;
		man.addToList(this);
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time % duration;
		if (newTime < 0) {newTime = duration - newTime;}
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

function sfxClipOverlapLoop(filename, playLength) {// Double buffer sound file that loops
	var audioFile = new Array(new Audio(audioPath+filename+audioFormat()), new Audio(audioPath+filename+audioFormat()));
	audioFile[0].onerror = function(){audioFile[0] = new Audio(audioPath+filename+audioFormat(true))};
	audioFile[1].onerror = function(){audioFile[1] = new Audio(audioPath+filename+audioFormat(true))};
	var currentClip = 0;
	var duration = playLength;
	this.name = filename;
	var clipVolume = 1;
	var mixVolume = 1;
	var playing = false;
	var virtual = false;
	var tick = 0;

	audioFile[0].pause();
	audioFile[1].pause();
	var man = SFXVolumeManager;
	man.addToList(this);

	this.play = function() {
		currentClip = (currentClip + 1) % 2;
		audioFile[currentClip].currentTime = 0;
		this.resume();
	}

	this.stop = function() {
		playing = false;
		this.pause();
		audioFile[0].currentTime = 0;
		audioFile[1].currentTime = 0;
	}

	this.resume = function() {
		this.updateVolume();
		if (clipVolume > 0.1) {
			audioFile[currentClip].play();
		} else {
			virtual = true;
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && virtual) {
			audioFile[currentClip].currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {
			audioFile[0].pause();
			audioFile[1].pause();
		}
		AudioEventManager.removeTimerEvent(this);
		playing = false;
		virtual = false
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			this.play();
		}
	}

	this.updateVolume = function() {
		var newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile[0].volume = Math.pow(newVolume  * man.getVolume() * !man.getMuted(), 2);
		audioFile[1].volume = Math.pow(newVolume  * man.getVolume() * !man.getMuted(), 2);
		if(playing && virtual && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(newTime);
			audioFile[currentClip].play();
			virtual = false;
		}
		if(clipVolume < 0.1) {
			audioFile[0].pause();
			audioFile[1].pause();
			virtual = true;
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

	this.getAudioFile = function() {
		return audioFile;
	}

	this.setVolumeManager = function(newManager) {
		man.removeFromList(this);
		man = newManager;
		man.addToList(this);
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time % duration;
		if (newTime < 0) {newTime = duration - newTime;}
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

function sfxClipSpriteSheet(filename, listOfTimePairs) {// A single file holding several sound clips
	var audioFile = new Audio(audioPath+filename+audioFormat());
	audioFile.onerror = function(){audioFile = new Audio(audioPath+filename+audioFormat(true))};
	audioFile.onloadeddata = init;
	var times = listOfTimePairs;
	this.name = filename;
	var duration = audioFile.duration;
	var currentClip = 0;
	var schedualedClip = currentClip;
	var totalClips = times.length;
	var clipVolume = 1;
	var spriteVolume = [];
	var mixVolume = 1;
	var playing = false;
	var virtual = false;
	var tick = 0;

	audioFile.pause();
	var man = SFXVolumeManager;
	man.addToList(this);

	for (var i = 0; i < times.length; i++) {
	 	spriteVolume[i] = 1;
	 }


	function init() {
		duration = audioFile.duration;
	}

	this.play = function() {
		currentClip = schedualedClip;

		var startAt = times[currentClip][0];
		audioFile.currentTime = startAt;

		this.resume();
	}

	this.stop = function() {
		this.pause();
		audioFile.currentTime = 0;

		currentClip = schedualedClip;
	}

	this.resume = function() {
		this.updateVolume();
		if (clipVolume > 0.1) {
			audioFile.play();
		} else {
			virtual = true;
		}
		AudioEventManager.addStopEvent(this, (this.getDuration(currentClip) - this.getTime()));
		AudioEventManager.addTimerEvent(this, (this.getDuration(currentClip) - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && virtual && clipVolume < 0.1) {
			audioFile.currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {
			audioFile.pause();
		}
		AudioEventManager.removeStopEvent(this);
		AudioEventManager.removeTimerEvent(this);
		playing = false;
		virtual = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			playing = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume * spriteVolume[currentClip];
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && virtual && newVolume >= 0.1) {
			var newTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(newTime);
			audioFile.play();
			virtual = false;
		}
		if(clipVolume < 0.1) {
			audioFile.pause();
			virtual = true;
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

	this.setSpriteVolume = function(clipNumber, volume) {
		spriteVolume[clipNumber] = volume;

		if (clipNumber == currentClip) this.updateVolume();
	}

	this.getSourceClip = function() {
		return this;
	}

	this.getChildClips = function() {
		return false;
	}

	this.getAudioFile = function() {
		return [audioFile];
	}

	this.setVolumeManager = function(newManager) {
		man.removeFromList(this);
		man = newManager;
		man.addToList(this);
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;

		if (this.getPaused()) currentClip = schedualedClip;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getTimePair = function(clipNumber) {
		return times[clipNumber];
	}

	this.setTime = function(time) {
		audioFile.currentTime = times[currentClip][0] + time;
		if (playing) {
			AudioEventManager.addStopEvent(this, this.getDuration(currentClip) - this.getTime());
			AudioEventManager.addTimerEvent(this, this.getDuration(currentClip) - this.getTime(), "tick");
		}
	}

	this.getTime = function() {
		return audioFile.currentTime - times[currentClip][0];
	}
	
	this.getDuration = function() {
		return times[currentClip][1] - times[currentClip][0];
	}
	
	this.getClipDuration = function(clipNumber) {
		return times[clipNumber][1] - times[clipNumber][0];
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function sfxClipSprite(spriteSheet, clipNumber) {// A referance to the clips in sfxClipSpriteSheet
	var spriteFile = spriteSheet;
	var clip = clipNumber;
	var duration = spriteFile.getClipDuration(clip);
	var clipVolume = 1;
	this.name = "sfxClipSprite " + spriteFile.name + " " + clipNumber;
	var tick = 0;
	var lastTime = 0;
	var playing = false;

	this.play = function() {
		spriteFile.setCurrentClip(clip);
		spriteFile.play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
		playing = true;
	}

	this.stop = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.stop();
		}
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.resume = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.resume();
		} else if (spriteFile.getPaused()) {
			spriteFile.setCurrentClip(clip);
			spriteFile.setTime(lastTime);
			spriteFile.resume();
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.pause();
		}
		AudioEventManager.removeTimerEvent(this);
		lastTime = this.getTime();
		playing = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			playing = false;
			lastTime = duration;
		}
	}

	this.updateVolume = function() {
		spriteFile.updateVolume();		
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		spriteFile.setSpriteVolume(clip, clipVolume);
	}

	this.getVolume = function() {
		return clipVolume;
	}

	this.getSourceClip = function() {
		return spriteFile.getSourceClip();
	}

	this.getChildClips = function() {
		return [spriteFile];
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
		return duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

//---//---Music Classes
MusicVolumeManager = new volumeManager();

function musicClip(filename, playLength) {//Single buffer music file
	var audioFile = new Audio(audioPath+filename+audioFormat());
	audioFile.onerror = function(){audioFile = new Audio(audioPath+filename+audioFormat(true))};
	this.name = filename;
	var duration = playLength;
	var clipVolume = 1;
	var mixVolume = 1;
	var tick = 0;
	var playing = false;
	var virtual = false;

	audioFile.pause();
	audioFile.loop = false;
	var man = MusicVolumeManager;
	man.addToList(this);

	this.play = function() {
		audioFile.currentTime = 0;
		this.resume();
	}

	this.stop = function() {
		playing = false;
		this.pause();
		audioFile.currentTime = 0;
	}

	this.resume = function() {
		this.updateVolume();
		if (clipVolume > 0.1) {
			audioFile.play();
		} else {
			virtual = true;
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && virtual) {
			audioFile.currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {
			audioFile.pause();
		}
		audioFile.pause();
		AudioEventManager.removeTimerEvent(this);
		playing = false;
		virtual = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			playing = false;
			virtual = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile.volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && virtual && newVolume >= 0.1) {
			var newTime = AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(duration - newTime);
			audioFile.play();
			virtual = false;
		}
		if(clipVolume < 0.1) {
			audioFile.pause();
			virtual = true;
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

	this.getAudioFile = function() {
		var audioArray = new Array(1);
		audioArray[0] = audioFile;
		return audioArray;
	}

	this.setVolumeManager = function(newManager) {
		man.removeFromList(this);
		man = newManager;
		man.addToList(this);
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time % duration;
		if (newTime < 0) {newTime = duration - newTime;}
		audioFile.currentTime = newTime;
		if (this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
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
	var virtual = false;

	audioFile[0].pause();
	audioFile[1].pause();
	var man = MusicVolumeManager;
	man.addToList(this);

	this.play = function() {
		if (playing) audioFile[currentClip].pause();
		currentClip = (currentClip + 1) % 2;
		audioFile[currentClip].currentTime = 0;
		this.resume();
	}

	this.stop = function() {
		playing = false;
		this.pause();
		audioFile[0].currentTime = 0;
		audioFile[1].currentTime = 0;
	}

	this.resume = function() {
		this.updateVolume();
		if (clipVolume > 0.1) {
			audioFile[currentClip].play();
		} else {
			virtual = true;
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && virtual) {
			audioFile[currentClip].currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {
			audioFile[0].pause();
			audioFile[1].pause();
		}
		AudioEventManager.removeTimerEvent(this);
		playing = false;
		virtual = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			playing = false;
			virtual = false;
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile[currentClip].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && virtual && newVolume >= 0.1) {
			var newTime = AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(duration - newTime);
			audioFile[currentClip].play();
			virtual = false;
		}
		if(clipVolume < 0.1) {
			audioFile[0].pause();
			audioFile[1].pause();
			virtual = true;
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

	this.getAudioFile = function() {
		return audioFile;
	}

	this.setVolumeManager = function(newManager) {
		man.removeFromList(this);
		man = newManager;
		man.addToList(this);
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time % duration;
		if (newTime < 0) {newTime = duration - newTime;}
		audioFile[currentClip].currentTime = newTime;
		if (!this.getPaused()) {AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");}
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
	var virtual = false;

	audioFile[0].pause();
	audioFile[1].pause();
	var man = MusicVolumeManager;
	man.addToList(this);

	this.play = function() {
		if (playing) audioFile[currentClip].pause();
		currentClip = (currentClip + 1) % 2;
		audioFile[currentClip].currentTime = 0;
		this.resume();
	}

	this.stop = function() {
		playing = false;
		this.pause();
		audioFile[0].currentTime = 0;
		audioFile[1].currentTime = 0;
	}

	this.resume = function() {
		this.updateVolume();
		if (clipVolume > 0.1) {
			audioFile[currentClip].play();
		} else {
			virtual = true;
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		playing = true;
	}

	this.pause = function() {
		if(playing && virtual) {
			audioFile[currentClip].currentTime = duration - AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
		} else {
			audioFile[0].pause();
			audioFile[1].pause();
		}
		AudioEventManager.removeTimerEvent(this);
		playing = false;
		virtual = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			playing = false;
			this.play();
		}
	}

	this.updateVolume = function() {
		newVolume = clipVolume * mixVolume;
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		audioFile[0].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		audioFile[1].volume = Math.pow(newVolume * man.getVolume() * !man.getMuted(), 2);
		if(playing && virtual && newVolume >= 0.1) {
			var newTime = AudioEventManager.getEventSecondsRemaining(this, TIMER, "tick");
			this.setTime(duration - newTime);
			audioFile[currentClip].play();
			virtual = false;
		}
		if(clipVolume < 0.1) {
			audioFile[0].pause();
			audioFile[1].pause();
			virtual = true;
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

	this.getAudioFile = function() {
		return audioFile;
	}

	this.setVolumeManager = function(newManager) {
		man.removeFromList(this);
		man = newManager;
		man.addToList(this);
	}

	this.resetTick = function() {
		tick = 0;
	}

	this.getTick = function() {
		return tick;
	}

	this.setTime = function(time) {
		var newTime = time % duration;
		if(newTime < 0) {newTime = duration - newTime;}
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

//---//---Container Classes

function container(clipList) {//Basic Container
	var audioClip = [];
	var currentClip = 0;
	var schedualedClip = 0;
	this.name = "container";
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
		currentClip = schedualedClip;
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
		return clipVolume;
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

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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

function containerLoop(clipList) {//Basic Container
	var audioClip = [];
	var currentClip = 0;
	this.name = "containerLoop";
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
		currentClip = schedualedClip;
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
		if (callSign == "tick") {
			this.play();
			tick++;
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
		return clipVolume;
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

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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

function containerLoopRandom(clipList) {//Plays a random list-item on playback
	var audioClip = [];
	var currentClip = Math.floor(Math.random() * audioClip.length);
	var schedualedClip = currentClip;
	this.name = "containerLoopRandom";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		currentClip = schedualedClip;
		schedualedClip = Math.floor(Math.random() * audioClip.length);
		if (schedualedClip == currentClip) schedualedClip = schedualedClip++ % audioClip.length;

		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
		currentClip = schedualedClip;
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
		return clipVolume;
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

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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

function containerLoopRandomRepetitionControl(clipList, maxRepetitions = 3, minRepetitions = 1) {//Picks new random list-item to play every loop
	var audioClip = [];
	var currentClip = Math.floor(Math.random() * audioClip.length);
	var schedualedClip = currentClip;
	this.name = "containerLoopRandomRepetitionControl";
	var playCountdown = 0;
	var playMax = maxRepetitions;
	var playMin = minRepetitions;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		if (playCountdown <= 0) {
			currentClip = schedualedClip;
			schedualedClip = Math.floor(Math.random() * audioClip.length);
			if (schedualedClip == currentClip) schedualedClip = schedualedClip++ % audioClip.length;
			playCountdown = Math.floor(Math.random() * (playMax - playMin + 1) + playMin);
		}

		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
		playCountdown--;
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
		currentClip = schedualedClip;
		playCountdown = 0;
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
			this.play();
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
		return clipVolume;
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) {
			currentClip = schedualedClip;
			playCountdown = 0;
		}
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

function containerLoopRandomDurationControl(clipList, maxDurationInSeconds = 180, minDurationInSeconds = 60) {//Picks new random list-item to play every loop
	var audioClip = [];
	var currentClip = Math.floor(Math.random() * audioClip.length);
	var schedualedClip = currentClip;
	this.name = "containerLoopRandomDurationControl";
	var playTime = 0;
	var playMax = maxDurationInSeconds;
	var playMin = minDurationInSeconds;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		if (playTime > playMin && Math.random() <= (playTime - playMin)/(playMax - playMin)) {
			currentClip = schedualedClip;
			schedualedClip = Math.floor(Math.random() * audioClip.length);
			if (schedualedClip == currentClip) schedualedClip = schedualedClip++ % audioClip.length;
			playTime = 0;
		}

		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
		playTime += audioClip[currentClip].getDuration();
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
		currentClip = schedualedClip;
		playTime = 0;
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
		return clipVolume;
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) {
			currentClip = schedualedClip;
			playTime = 0;
		}
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

function containerRandom(clipList) {//Plays a random list-item on playback
	var audioClip = [];
	var currentClip = Math.floor(Math.random() * audioClip.length);;
	var schedualedClip = currentClip;
	this.name = "containerRandom";
	var lastRandomIndex = -1;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		currentClip = schedualedClip;
		schedualedClip = Math.floor(Math.random() * audioClip.length);
		if (schedualedClip == currentClip) schedualedClip = schedualedClip++ % audioClip.length;

		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
		currentClip = schedualedClip;		
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
		return clipVolume;
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

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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

function containerLayer(clipList) {//Plays all list-items together
	var audioClip = [];
	var currentClip = 0;
	this.name = "containerLayer";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	function findLongestPlayingClip() {
		var newCurrentClip = 0;
		var newCurrentDuration = 0;

		for (var i = 0; i < audioClip.length; i++) {
			if (!audioClip[i].getPaused() && audioClip[i].getDuration() > newCurrentDuration) {
				newCurrentClip = i;
				newCurrentDuration = audioClip[i].getDuration();
			}
		}
		return newCurrentClip;
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
		if (slot >= audioClip.length) return;
		audioClip[slot].setVolume(clipVolume * level);
	}

	this.getLayerLevel = function(slot) {
		return audioClip[slot].getVolume();
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume * audioClip[i].getVolume());
		}
	}

	this.getVolume = function() {
		return clipVolume;
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
			audioClip[i].setTime(time);
		}
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	this.getTime = function() {
		var longestClip = findLongestPlayingClip();
		return audioClip[longestClip].getTime();
	}
	
	this.getDuration = function() {
		var longestClip = findLongestPlayingClip();
		return audioClip[longestClip].getDuration();
	}

	this.getPaused = function() {
		for (var i = 0; i < audioClip.length; i++) {
			if (!audioClip[i].getPaused()) {
				return false;
			}
		}
		return true;
	}

	return this;
}

function containerLayersLoop(clipList) {//Plays all list-items together, controls volumes, loops
	var audioClip = [];
	var currentClip = 0;
	this.name = "containerLayersLoop";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	function findLongestPlayingClip() {
		var newCurrentClip = 0;
		var newCurrentDuration = 0;
		var isPaused = this.getPaused();

		for (var i = 0; i < audioClip.length; i++) {
			if ((isPaused || !audioClip[i].getPaused()) && audioClip[i].getDuration() > newCurrentDuration) {
				newCurrentClip = i;
				newCurrentDuration = audioClip[i].getDuration();
			}
		}
		return newCurrentClip;
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
			this.play();
		}
	}

	this.setLayerLevel = function(slot, level) {
		if (slot >= audioClip.length) return;
		audioClip[slot].setVolume(clipVolume * level);
	}

	this.getLayerLevel = function(slot) {
		return audioClip[slot].getVolume();
	}

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		for (i in audioClip) {
			audioClip[i].setVolume(clipVolume * audioClip[i].getVolume());
		}
	}

	this.getVolume = function() {
		return clipVolume;
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
			audioClip[i].setTime(time);
		}
		if (!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		}
	}

	this.getTime = function() {
		var longestClip = findLongestPlayingClip();
		return audioClip[longestClip].getTime();
	}
	
	this.getDuration = function() {
		var longestClip = findLongestPlayingClip();
		return audioClip[longestClip].getDuration();
	}

	this.getPaused = function() {
		for (var i = 0; i < audioClip.length; i++) {
			if (!audioClip[i].getPaused()) {
				return false;
			}
		}
		return true;
	}

	return this;
}

function containerBlend(clipList, startingLevel = 0) {//Container which blends between the volumes of list-items (values 0-1)
	var audioClip = [];
	var currentClip = 0;
	this.name = "containerBlend";
	var currentLevel = startingLevel;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	var overlap = 1 / (audioClip.length-1);
	function defineVolumes() {
		for (var i = 0; i < audioClip.length; i++) {
			var relativeLevel = Math.abs(currentLevel - i*overlap);
			if (relativeLevel >= overlap) {
				audioClip[i].setVolume(0);
			}
			if (relativeLevel < overlap) {
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

	this.updateVolume = function() {
		for (var i in audioClip) {
			audioClip[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		clipVolume = newVolume;
		defineVolumes();
	}

	this.getVolume = function() {
		return clipVolume;
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
		var newCurrentClip = 0;
		var newCurrentDuration = 0;
		var isPaused = this.getPaused();

		for (var i = 0; i < audioClip.length; i++) {
			if ((isPaused || !audioClip[i].getPaused()) && audioClip[i].getDuration() > newCurrentDuration) {
				newCurrentClip = i;
				newCurrentDuration = audioClip[i].getDuration();
			}
		}
		return audioClip[newCurrentClip].getTime();
	}
	
	this.getDuration = function() {
		var newCurrentClip = 0;
		var newCurrentDuration = 0;
		var isPaused = this.getPaused();

		for (var i = 0; i < audioClip.length; i++) {
			if ((isPaused || !audioClip[i].getPaused()) && audioClip[i].getDuration() > newCurrentDuration) {
				newCurrentClip = i;
				newCurrentDuration = audioClip[i].getDuration();
			}
		}
		return audioClip[newCurrentClip].getDuration();
	}

	this.getPaused = function() {
		for (var i = 0; i < audioClip.length; i++) {
			if (!audioClip[i].getPaused()) {
				return false;
			}
		}
		return true;
	}

	return this;
}

function containerDelayControl(clipList, maxDurationInSeconds = 1, minDurationInSeconds = 0) {//Plays clip after a random duration
	var audioClip = [];
	var currentClip = Math.floor(Math.random() * audioClip.length);
	var schedualedClip = currentClip;
	this.name = "containerPlayDelayRandom";
	var delayTime = (Math.random() * playMax - playMin) + playMin;
	var schedualedDelayTime = delayTime;
	var playMax = maxDurationInSeconds;
	var playMin = minDurationInSeconds;
	var clipVolume = 1;
	var tick = 0;
	var timeLeft = delayTime;
	var playing = false;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		currentClip = schedualedClip;
		timeLeft = delayTime;
		delayTime = schedualedDelayTime;
		schedualedDelayTime = (Math.random() * playMax - playMin) + playMin;

		AudioEventManager.addPlayEvent(audioClip[currentClip], delayTime);
		AudioEventManager.addTimerEvent(this, (delayTime + audioClip[currentClip].getDuration()), "tick");
		playing = true;
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removePlayEvent(audioClip[currentClip]);
		AudioEventManager.removeTimerEvent(this);
		playing = false;
		currentClip = schedualedClip;
		delayTime = schedualedDelayTime;
	}

	this.resume = function() {
		if (timeLeft > 0) {
			AudioEventManager.addPlayEvent(audioClip[currentClip], timeLeft);
			AudioEventManager.addTimerEvent(this, (timeLeft + audioClip[currentClip].getDuration()), "tick");
		} else {
			audioClip[currentClip].resume();
			AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
		}
		playing = true;
	}

	this.pause = function() {
		for (var i in audioClip) {
			audioClip[i].pause();
		}
		timeLeft = AudioEventManager.getEventSecondsRemaining(PLAY, audioClip[currentClip]);
		AudioEventManager.removePlayEvent(audioClip[currentClip]);
		AudioEventManager.removeTimerEvent(this);
		playing = false;
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
			playing = false;
			delayTime = (Math.random() * playMax - playMin) + playMin;
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
		return clipVolume;
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

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.setTime = function(time) {
		if (time > delayTime) {
			audioClip[currentClip].setTime(time - delayTime);
			if (!audioClip[currentClip].getPaused()) {
				AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
			} else if (!this.getPaused()) {
				audioClip[currentClip].resume();
				AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
			}
		} else {
			timeLeft = delayTime - time;
			AudioEventManager.addPlayEvent(audioClip[currentClip], timeLeft);
			AudioEventManager.addTimerEvent(this, (timeLeft + audioClip[currentClip].getDuration()), "tick");
		}
	}

	this.getTime = function() {
		var delayRemaining = AudioEventManager.getEventSecondsRemaining(PLAY, audioClip[currentClip]);
		return audioClip[currentClip].getTime() + delayTime - delayRemaining;
	}
	
	this.getDuration = function() {
		return audioClip[currentClip].getDuration() + delayTime;
	}

	this.getPaused = function() {
		return !playing;
	}

	return this;
}

function containerConcatenated(clipList) {//Reports all list-items as one item and plays through them
	var audioClip = [];
	var currentClip = 0;
	this.name = "containerConcatenated";
	var duration = 0;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
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
		return clipVolume;
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
		if(!this.getPaused()) {
			AudioEventManager.addTimerEvent(this, (audioClip[currentClip].getDuration() - audioClip[currentClip].getTime()), "tick");
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

function containerConcatenatedLatchLast(clipList) {//Reports all list-items as one item, but only repeats last one
	var audioClip = [];
	var currentClip = 0;
	this.name = "containerConcatenatedLatchLast";
	var duration = 0;
	var atEnd = false;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
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
		return clipVolume;
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

function containerConcatenatedLoop(clipList) {//Loops list-items as if one item
	var audioClip = [];
	var currentClip = 0;
	this.name = "containerConcatenatedLoop";
	var duration = 0;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
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
		return clipVolume;
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

function containerConcatenatedLoopLast(clipList) {//Loop all list-items as one item, but only repeats last one
	var audioClip = [];
	var currentClip = 0;
	this.name = "containerConcatenatedLoopLast";
	var duration = 0;
	var atEnd = false;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
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
		return clipVolume;
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

function containerCrossfade(clipList) {//Can crossfade between list-items
	var audioClip = [];
	var currentClip = 0;
	var schedualedClip = currentClip;
	this.name = "containerCrossfade";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
		audioClip[i].setVolume(0)
	}
	audioClip[0].setVolume(1);

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
		currentClip = schedualedClip;
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

	this.switchTo = function(slot, fadeTime = 0.5) {
		if (currentClip == slot) return;

		if(!audioClip[currentClip].getPaused()) {
			audioClip[slot].setTime(audioClip[currentClip].getTime());
			audioClip[slot].resume();
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(audioClip[slot], fadeTime, clipVolume);
			currentClip = slot;
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		} else {
			audioClip[currentClip].stop();
			currentClip = slot;
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
		return clipVolume;
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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

function containerCrossfadeLoop(clipList) {//Can crossfade between list-items, loops current item
	var audioClip = [];
	var currentClip = 0;
	var schedualedClip = currentClip;
	this.name = "containerCrossfadeLoop";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
		audioClip[i].setVolume(0)
	}
	audioClip[0].setVolume(1);

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
		currentClip = schedualedClip;
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
		if (callSign == "tick") {
			this.play();
			tick++;
		}
	}

	this.switchTo = function(slot, fadeTime = 0.5) {
		if (currentClip == slot) return;

		if(!audioClip[currentClip].getPaused()) {
			audioClip[slot].setTime(audioClip[currentClip].getTime());
			audioClip[slot].resume();
			AudioEventManager.addCrossfadeEvent(audioClip[currentClip], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(audioClip[slot], fadeTime, clipVolume);
			currentClip = slot;
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "tick");
		} else {
			audioClip[currentClip].stop();
			currentClip = slot;
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
		return clipVolume;
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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

function containerSequence(clipList) {//Plays list-items in order
	var audioClip = [];
	var currentClip = 0;
	var schedualedClip = currentClip;
	this.name = "containerSequence";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		currentClip = schedualedClip;
		schedualedClip = schedualedClip++ % audioClip.length;

		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
		currentClip = schedualedClip;
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
		return clipVolume;
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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

function containerSequenceLatch(clipList) {//Plays list-items in order, but stays on current one until indicated
	var audioClip = [];
	var currentClip = 0;
	var schedualedClip = currentClip;
	this.name = "containerSequenceLatch";
	var latched = true;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		currentClip = schedualedClip;
		latched = true;

		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
		currentClip = schedualedClip;
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

	this.continue = function() {
		if (latched) {
			schedualedClip++;
			schedualedClip = schedualedClip++ % audioClip.length;
			latched = false;
		}
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			tick++;
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
		return clipVolume;
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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

function containerSequenceLatchLast(clipList) {//Plays list-items in order, stays on last item
	var audioClip = [];
	var currentClip = 0;
	var schedualedClip = currentClip;
	this.name = "containerSequenceLatchLast";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		currentClip = schedualedClip;
		if (schedualedClip < audioClip.length - 1) schedualedClip ++;

		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
		currentClip = schedualedClip;
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
		return clipVolume;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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

function containerPlaylist(clipList) {//Plays through list-items in order
	var audioClip = [];
	var currentClip = 0;
	var schedualedClip = currentClip;
	this.name = "containerPlaylist";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	var clipVolume = 1;

	this.play = function() {
		currentClip = schedualedClip;
		schedualedClip = schedualedClip++ % audioClip.length;

		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
		schedualedClip = currentClip;
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
			currentClip++;
			if (currentClip < audioClip.length - 1) {
				this.play();
			}
			tick++;
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
		return clipVolume;
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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

function containerPlaylistLoop(clipList) {//Loops through list-items in order
	var audioClip = [];
	var currentClip = 0;
	var schedualedClip = currentClip;
	this.name = "containerPlaylistLoop";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		currentClip = schedualedClip;
		schedualedClip = schedualedClip++ % audioClip.length;

		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
		schedualedClip = currentClip;
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
		return clipVolume;
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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

function containerPlaylistLoopLatch(clipList) {//Plays through list-items in order, but loops current one until indicated
	var audioClip = [];
	var currentClip = 0;
	var schedualedClip = currentClip;
	this.name = "containerPlaylistLoopLatch";
	var latched = true;
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		currentClip = schedualedClip;
		latched = true;

		audioClip[currentClip].play();
		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
		if (latched) schedualedClip = currentClip;
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

	this.continue = function() {
		if (latched) {
			schedualedClip++;
			schedualedClip = schedualedClip++ % audioClip.length;
			latched = false;
		}
	}

	this.trigger = function(callSign) {
		if(callSign == "tick") {
			this.play();
			tick++;
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
		return clipVolume;
	}

	this.getListLength = function() {
		 return audioClip.length;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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

function containerPlaylistLoopLast(clipList) {//Plays through list-items in order, loops last item
	var audioClip = [];
	var currentClip = 0;
	var schedualedClip = currentClip;
	this.name = "containerPlaylistLoopLast";
	var clipVolume = 1;
	var tick = 0;

	for (var i in clipList) {
		audioClip[i] = clipList[i];
	}

	this.play = function() {
		audioClip[currentClip].play();
		currentClip = schedualedClip;
		if (schedualedClip < audioClip.length - 1) schedualedClip ++;

		AudioEventManager.addTimerEvent(this, this.getDuration(), "tick");
	}

	this.stop = function() {
		currentClip = 0;
		for (var i in audioClip) {
			audioClip[i].stop();
		}
		AudioEventManager.removeTimerEvent(this);
		schedualedClip = currentClip;
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
			if (currentClip < audioClip.length - 1) {
				currentClip++;
			}
			this.play();
			tick++;
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
		return clipVolume;
	}

	this.setCurrentClip = function(clipNumber) {
		schedualedClip = clipNumber;
		if (this.getPaused()) currentClip = schedualedClip;
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