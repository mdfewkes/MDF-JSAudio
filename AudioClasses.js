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
var isMuted = false;

//SFX Classes
//It is possible all SFX objects fail to handle container volumes correctly, see var clipVolume
var sfxVolume = 1;
SFXVolumeManager = new sfxVolumeManager();
function sfxVolumeManager() {
	var clipList = [];

	this.setVolume = function(amount) {
		if (amount > 1) {sfxVolume = 1;}
		else if (amount < 0) {sfxVolume = 0;}
		else {sfxVolume = amount;}
		for (var i in clipList) {
			clipList[i].updateVolume();
		}
	}

	this.getVolume = function() {
		return sfxVolume;
	}

	this.updateVolume = function() {
		for(var i in clipList) {
			clipList[i].updateVolume();
		}
	}

	this.addToList = function(sfxClip) {
		clipList.push(sfxClip);
	}
}

function getRandomVolume(){
	var min = 0.85;
	var max = 1;
	var randomVolume = Math.random() * (max - min) + min;
	return randomVolume.toFixed(2);
}

function sfxClip(filename) {//A simple, single buffer sound clip
	var soundFile = new Audio(audioPath+filename+audioFormat());
	soundFile.onerror = function(){soundFile = new Audio(audioPath+filename+audioFormat(true))};
	var clipVolume = 1;
	var randVolume = true;
	var clipName = filename;
	var duration = soundFile.duration;
	var mixVolume = 1;

	soundFile.pause();
	SFXVolumeManager.addToList(this);


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

	this.trigger = function(callSign) {
	}

	this.updateVolume = function() {
		if (randVolume) {
			soundFile.volume = Math.pow(mixVolume * sfxVolume * clipVolume * getRandomVolume() * !isMuted, 2);
		} else {
			soundFile.volume = Math.pow(mixVolume * sfxVolume * clipVolume * !isMuted, 2);
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		soundFile.volume = Math.pow(mixVolume * newVolume * sfxVolume * !isMuted, 2);
		clipVolume = newVolume;
	}

	this.getVolume = function() {
		return sfxVolume * clipVolume * !isMuted;
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.setTime = function(time) {
		soundFile.currentTime = time;
	}

	this.getTime = function() {
		return soundFile.currentTime;
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

	return this;
}

function sfxClipOverlap(filename, voices = 2) {//A sound clip with as many buffers as specified
	var soundFile = new array(voices);
	var maxVoices = soundfile.length;

	for (var i in soundFile) {
		soundFile[i] = new Audio(audioPath+filename+audioFormat());
		soundFile[i].onerror = function(){soundFile[i] = new Audio(audioPath+filename+audioFormat(true))};
		soundFile[i].pause();
	}

	var currentClip = 0;
	var clipVolume = 1;
	var randVolume = true;
	var clipName = filename;
	var duration = soundFile[0].duration;
	var mixVolume = 1;


	SFXVolumeManager.addToList(this);

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

	this.trigger = function(callSign) {
	}

	this.updateVolume = function() {
		if (randVolume) {
			for (var i in soundFile) {
				soundFile[i].volume = Math.pow(mixVolume * sfxVolume * clipVolume * getRandomVolume() * !isMuted, 2);
			}
		} else {
			for (var i in soundFile) {
				soundFile[i].volume = Math.pow(mixVolume * sfxVolume * clipVolume * !isMuted, 2);
			}
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		for (var i in soundFile) {
			soundFile[i].volume = Math.pow(mixVolume * newVolume * sfxVolume * !isMuted, 2);
		}
		clipVolume = newVolume;
	}

	this.getVolume = function() {
		return sfxVolume * clipVolume * !isMuted;
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.setTime = function(time) {
		soundFile.currentTime[currentClip] = time;
	}

	this.getTime = function() {
		return soundFile[currentClip].currentTime;
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

	return this;
}

function sfxClipOverlapLoop(filename, playLength) {//Double buffer sound file that loops
	var musicFile = new Array(new Audio(audioPath+filename+audioFormat()), new Audio(audioPath+filename+audioFormat()));
	soundFile[0].onerror = function(){soundFile[0] = new Audio(audioPath+filename+audioFormat(true))}
	soundFile[1].onerror = function(){soundFile[1] = new Audio(audioPath+filename+audioFormat(true))}
	var currentClip = 0;
	var duration = playLength;
	var clipName = filename;
	var clipVolume = 1;
	var mixVolume = 1;

	soundFile[0].pause();
	soundFile[1].pause();
	SFXVolumeManager.addToList(this);

	this.play = function() {
		soundFile[currentClip].currentTime = 0;
		this.updateVolume();
		soundFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		soundFile[0].pause();
		soundFile[0].currentTime = 0;
		soundFile[1].pause();
		soundFile[1].currentTime = 0;
	}

	this.resume = function() {
		soundFile[currentClip].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		soundFile[0].pause();
		soundFile[1].pause();
	}

	this.trigger = function(callSign) {
		if(callSign == "cue") {
			currentClip++;
			if (currentClip > 1) {currentClip = 0;}
			this.play();
		}
	}

	this.updateVolume = function() {
		soundFile[0].volume = Math.pow(mixVolume * sfxVolume  * clipVolume * !isMuted, 2);
		soundFile[1].volume = Math.pow(mixVolume * sfxVolume  * clipVolume * !isMuted, 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		soundFile[currentClip].volume = Math.pow(mixVolume * newVolume * musicVolume * !isMuted, 2);
		clipVolume = newVolume;
		if (clipVolume <= 0) { this.stop();}
	}

	this.getVolume = function() {
		return clipVolume * !isMuted;
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.setTime = function(time) {
		var newTime = time;
		while (newTime >= duration) {newTime -= duration;}
		if(newTime < 0) {newTime = 0;}
		soundFile[currentClip].currentTime = newTime;
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return soundFile[currentClip].currentTime;
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

	return this;
}

function sfxClipSpriteSheet(filename, listOfTimePairs) {//A single file holding several sound clips
	var soundFile = new Audio(audioPath+filename+audioFormat());
	soundFile.onerror = function(){soundFile = new Audio(audioPath+filename+audioFormat(true))};
	var times = listOfTimePairs;
	var clipVolume = 1;
	var randVolume = true;
	var clipName = filename;
	var duration = soundFile.duration;
	var currentClip = 0;
	var totalClips = times.length;
	var mixVolume = 1;

	soundFile.pause();
	SFXVolumeManager.addToList(this);


	this.play = function() {
		var startAt = times[currentClip][0];
		soundFile.currentTime = startAt;
		this.updateVolume();
		soundFile.play();
		AudioEventManager.addStopEvent(this, (times[currentClip][1] - times[currentClip][0]));
	}

	this.stop = function() {
		soundFile.pause();
		soundFile.currentTime = 0;
		AudioEventManager.removeStopEvent(this);
	}

	this.resume = function() {
		this.play();
	}

	this.pause = function() {
		soundFile.pause();
		AudioEventManager.removeStopEvent(this);
	}

	this.trigger = function(callSign) {
	}

	this.updateVolume = function() {
		if (randVolume) {
			soundFile.volume = Math.pow(mixVolume * sfxVolume * clipVolume * getRandomVolume() * !isMuted, 2);
		} else {
			soundFile.volume = Math.pow(mixVolume * sfxVolume * clipVolume * !isMuted, 2);
		}
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		soundFile.volume = Math.pow(mixVolume * newVolume * sfxVolume * !isMuted, 2);
		clipVolume = newVolume;
	}

	this.getVolume = function() {
		return sfxVolume * clipVolume * !isMuted;
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.setCurrentClip = function(clipNumber) {
		this.stop();
		if (clipNumber >= totalClips) {currentClip = 0;}
		else {currentClip = clipNumber;}
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.setTime = function(time) {
		soundFile.currentTime = time;
	}

	this.getTime = function() {
		return soundFile.currentTime;
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

	return this;
}

function sfxClipSprite(spriteSheet, clipNumber) {//A referance to the clips in sfxClipSpriteSheet
	var spriteFile = spriteSheet;
	var clip = clipNumber;
	var clipName = spriteFile.getClipName();

	this.play = function() {
		spriteFile.setCurrentClip(clip);
		spriteFile.play();
	}

	this.stop = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.stop();
		}
	}

	this.resume = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.resume();
		}
	}

	this.pause = function() {
		if(spriteFile.getCurrentClip() == clip) {
			spriteFile.pause();
		}
	}

	this.trigger = function(callSign) {
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
	
	this.setClipName = function(name) {
		clipName = name;
	}

	this.getClipName = function() {
		return clipName;
	}
	
	this.getDuration = function() {
		//ahh?
	}

	this.getPaused = function() {
		return spriteFile.getPaused();
	}

	return this;
}

function sfxContainer(clipList) {//Basic Container
	var soundFile = [];
    var currentClip = 0;
    var clipVolume = 1;

	for (var i in clipList) {
		soundFile[i] = clipList[i];
		soundFile[i].pause();
	}

	this.play = function() {
		soundFile[currentClip].play();
	}

	this.stop = function() {
		for (var i in soundFile) {
			soundFile[i].stop();
		}
	}

	this.resume = function() {
		soundFile[currentClip].resume();
	}

	this.pause = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
		}
	}

	this.trigger = function(callSign) {
	}

	this.loadClip = function(newClip, slot) {
		soundFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in soundFile) {
			soundFile[i].updateVolume();
		}
	}

    this.setVolume = function (newVolume) {
        clipVolume = newVolume;
        for (i in soundFile) {
            soundFile[i].setVolume(clipVolume);
        }
	}

	this.getVolume = function() {
		return soundFile[currentClip].getVolume();
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return soundFile.length;
	}

	this.setTime = function(time) {
		soundFile[currentClip].setTime(time);
	}

	this.getTime = function() {
		return soundFile[currentClip].getTime();
	}
	
	this.setClipName = function(name) {
		soundFile[currentClip].setClipName(name);
	}

	this.getClipName = function() {
		return soundFile[currentClip].getClipName();
	}
	
	this.getDuration = function() {
		return soundFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return soundFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerRandom(clipList) {//Plays a random list-item on playback
	var soundFile = [];
    var currentClip = 0;
    var clipVolume = 1;

	for (var i in clipList) {
		soundFile[i] = clipList[i];
		soundFile[i].pause();
	}

	this.play = function() {
		currentClip = Math.floor(Math.random() * soundFile.length);
		soundFile[currentClip].play();
	}

	this.stop = function() {
		for (var i in soundFile) {
			soundFile[i].stop();
		}
	}

	this.resume = function() {
		soundFile[currentClip].resume();
	}

	this.pause = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
		}
	}

	this.trigger = function(callSign) {
	}

	this.loadClip = function(newClip, slot) {
		soundFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in soundFile) {
			soundFile[i].updateVolume();
		}
	}

    this.setVolume = function (newVolume) {
        clipVolume = newVolume;
        for (i in soundFile) {
            soundFile[i].setVolume(clipVolume);
        }
	}

	this.getVolume = function() {
		return soundFile[currentClip].getVolume();
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return soundFile.length;
	}

	this.setTime = function(time) {
		soundFile[currentClip].setTime(time);
	}

	this.getTime = function() {
		return soundFile[currentClip].getTime();
	}
	
	this.setClipName = function(name) {
		soundFile[currentClip].setClipName(name);
	}

	this.getClipName = function() {
		return soundFile[currentClip].getClipName();
	}
	
	this.getDuration = function() {
		return soundFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return soundFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerLayer(clipList) {//Plays all list-items together
	var soundFile = [];
    var currentClip = 0;
    var clipVolume = 1;

	for (var i in clipList) {
		soundFile[i] = clipList[i];
		soundFile[i].pause();
	}

	this.play = function() {
		for (var i in soundFile) {
			soundFile[i].play();
		}
	}

	this.stop = function() {
		for (var i in soundFile) {
			soundFile[i].stop();
		}
	}

	this.resume = function() {
		for (var i in soundFile) {
			soundFile[i].resume();
		}
	}

	this.pause = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
		}
	}

	this.trigger = function(callSign) {
	}

	this.setLayerLevel = function(slot, level) {
		soundFile[slot].setVolume(level);
	}

	this.loadClip = function(newClip, slot) {
		soundFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in soundFile) {
			soundFile[i].updateVolume();
		}
	}

    this.setVolume = function (newVolume) {
        clipVolume = newVolume;
        for (i in soundFile) {
            soundFile[i].setVolume(clipVolume);
        }
	}

	this.getVolume = function() {
		return soundFile[currentClip].getVolume();
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return soundFile.length;
	}

	this.setTime = function(time) {
		for (var i in soundFile) {
			soundFile[currentClip].setTime(time);
		}
	}

	this.getTime = function() {
		return soundFile[currentClip].getTime();
	}
	
	this.setClipName = function(name) {
		soundFile[currentClip].setClipName(name);
	}

	this.getClipName = function() {
		return soundFile[currentClip].getClipName();
	}
	
	this.getDuration = function() {
		return soundFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return soundFile[currentClip].getPaused();
	}

	return this;
}

function sfxContainerBlend(clipList, startingLevel = 0) {//Container which blends between the volumes of list-items
	var soundFile = [];
	var currentClip = 0;
    var currentLevel = startingLevel;
    var clipVolume = 1;

	for (var i in clipList) {
		soundFile[i] = clipList[i];
		soundFile[i].pause();
	}

	var overlap = 1/soundFile.length - 1;
	function defineVolumes() {
		for (var i = 0; soundFile.length; i++) {
			var relativeLevel = Math.abs(currentLevel - i*overlap);
			if (relativeLevel > overlap) {
				soundFile[i].setVolume(0);
			}
            if (relativeLevel <= overlap) {
                soundFile[i].setVolume(Math.abs(1 - relativeLevel / overlap) * clipVolume);
			}
		}

	}

	this.play = function() {
		defineVolumes();
		for (var i in soundFile) {
			soundFile[i].play();
		}
	}

	this.stop = function() {
		for (var i in soundFile) {
			soundFile[i].stop();
		}
	}

	this.resume = function() {
		defineVolumes();
		for (var i in soundFile) {
			soundFile[i].resume();
		}
	}

	this.pause = function() {
		for (var i in soundFile) {
			soundFile[i].pause();
		}
	}

	this.trigger = function(callSign) {
	}

	this.setLevel = function(newLevel) {
		currentLevel = newLevel;
		defineVolumes();		
	}

	this.loadClip = function(newClip, slot) {
		soundFile[slot] = newClip;
	}

	this.updateVolume = function() {
		for (var i in soundFile) {
			soundFile[i].updateVolume();
		}
	}

    this.setVolume = function (newVolume) {
        clipVolume = newVolume;
		defineVolumes();
	}

	this.getVolume = function() {
		return soundFile[currentClip].getVolume();
	}

	this.setCurrentClip = function(clipNumber) {
		currentClip = clipNumber;
	}

	this.getCurrentClip = function() {
		 return currentClip;
	}

	this.getListLength = function() {
		 return soundFile.length;
	}

	this.setTime = function(time) {
		for (var i in soundFile) {
			soundFile[currentClip].setTime(time);
		}
	}

	this.getTime = function() {
		return soundFile[currentClip].getTime();
	}
	
	this.setClipName = function(name) {
		soundFile[currentClip].setClipName(name);
	}

	this.getClipName = function() {
		return soundFile[currentClip].getClipName();
	}
	
	this.getDuration = function() {
		return soundFile[currentClip].getDuration();
	}

	this.getPaused = function() {
		return soundFile[currentClip].getPaused();
	}

	return this;
}

//Music Classes
//It is possible all music objects fail to handle container volumes correctly, see var trackVolume
var musicVolume = 1;
MusicVolumeManager = new musicVolumeManager();
function musicVolumeManager() {
	var trackList = [];

	this.setVolume = function(amount) {
		if (amount > 1) {musicVolume = 1;}
		else if (amount < 0) {musicVolume = 0;}
		else {musicVolume = amount;}
		for (var i in trackList) {
			trackList[i].updateVolume();
		}
	}

	this.getVolume = function() {
		return musicVolume;
	}

	this.updateVolume = function() {
		for(var i in trackList) {
			trackList[i].updateVolume();
		}
	}

	this.addToList = function(musicTrack) {
		trackList.push(musicTrack);
	}
}

function musicTrack(filename, playLength) {//Single buffer music file
	var musicFile = new Audio(audioPath+filename+audioFormat());
	musicFile.onerror = function(){musicFile = new Audio(audioPath+filename+audioFormat(true))};
	var duration = musicFile.duration;
	var trackName = filename;
	var duration = playLength;
	var trackVolume = 1;
	var mixVolume = 1;

	musicFile.pause();
	musicFile.loop = false;
	MusicVolumeManager.addToList(this);

	this.play = function() {
		musicFile.currentTime = 0;
		this.updateVolume();
		musicFile.play();
	}

	this.stop = function() {
		musicFile.pause();
		musicFile.currentTime = 0;
	}

	this.resume = function() {
		musicFile.play();
	}

	this.pause = function() {
		musicFile.pause();
	}

	this.playFrom = function(time) {
		this.setTime(time);
		musicFile.play();
	}

	this.trigger = function(callSign) {
	}

	this.updateVolume = function() {
		musicFile.volume = Math.pow(mixVolume * musicVolume  * trackVolume * !isMuted, 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile.volume = Math.pow(mixVolume * newVolume * musicVolume * !isMuted, 2);
		trackVolume = newVolume;
		if (trackVolume <= 0) { this.stop();}
	}

	this.getVolume = function() {
		return trackVolume * !isMuted;
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceTrack = function() {
		return this;
	}

	this.setTime = function(time) {
		var newTime = time;
		while(newTime >= duration) {newTime -= duration;}
		if(newTime < 0) {newTime = 0;}
		musicFile.currentTime = newTime;
	}

	this.getTime = function() {
		return musicFile.currentTime;
	}
	
	this.setTrackName = function(name) {
		trackName = name;
	}

	this.getTrackName = function() {
		return trackName;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return musicFile.paused;
	}

	return this;
}

function musicTrackOverlap(filename, playLength) {//Double buffer music file
	var musicFile = new Array(new Audio(audioPath+filename+audioFormat()), new Audio(audioPath+filename+audioFormat()));
	musicFile[0].onerror = function(){musicFile[0] = new Audio(audioPath+filename+audioFormat(true))}
	musicFile[1].onerror = function(){musicFile[1] = new Audio(audioPath+filename+audioFormat(true))}
	var currentTrack = 0;
	var duration = playLength;
	var trackName = filename;
	var trackVolume = 1;
	var mixVolume = 1;

	musicFile[0].pause();
	musicFile[1].pause();
	MusicVolumeManager.addToList(this);

	this.play = function() {
		currentTrack++;
		if (currentTrack > 1) {currentTrack = 0;}
		musicFile[currentTrack].currentTime = 0;
		this.updateVolume();
		musicFile[currentTrack].play();
	}

	this.stop = function() {
		musicFile[0].pause();
		musicFile[0].currentTime = 0;
		musicFile[1].pause();
		musicFile[1].currentTime = 0;
	}

	this.resume = function() {
		musicFile[currentTrack].play();
	}

	this.pause = function() {
		musicFile[0].pause();
		musicFile[1].pause();
	}

	this.playFrom = function(time) {
		this.setTime(time);
		musicFile[currentTrack].play();
	}

	this.trigger = function(callSign) {
	}

	this.updateVolume = function() {
		musicFile[0].volume = Math.pow(mixVolume * musicVolume  * trackVolume * !isMuted, 2);
		musicFile[1].volume = Math.pow(mixVolume * musicVolume  * trackVolume * !isMuted, 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile[currentTrack].volume = Math.pow(mixVolume * newVolume * musicVolume * !isMuted, 2);
		trackVolume = newVolume;
		if (trackVolume <= 0) { this.stop();}
	}

	this.getVolume = function() {
		return trackVolume * !isMuted;
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceTrack = function() {
		return this;
	}

	this.setTime = function(time) {
		var newTime = time;
		while (newTime >= duration) {newTime -= duration;}
		if(newTime < 0) {newTime = 0;}
		musicFile[currentTrack].currentTime = newTime;
	}

	this.getTime = function() {
		return musicFile[currentTrack].currentTime;
	}
	
	this.setTrackName = function(name) {
		trackName = name;
	}

	this.getTrackName = function() {
		return trackName;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return musicFile[currentTrack].paused;
	}

	return this;
}

function musicTrackOverlapLoop(filename, playLength) {//Double buffer music file that loops
	var musicFile = new Array(new Audio(audioPath+filename+audioFormat()), new Audio(audioPath+filename+audioFormat()));
	musicFile[0].onerror = function(){musicFile[0] = new Audio(audioPath+filename+audioFormat(true))}
	musicFile[1].onerror = function(){musicFile[1] = new Audio(audioPath+filename+audioFormat(true))}
	var currentTrack = 0;
	var duration = playLength;
	var trackName = filename;
	var trackVolume = 1;
	var mixVolume = 1;

	musicFile[0].pause();
	musicFile[1].pause();
	MusicVolumeManager.addToList(this);

	this.play = function() {
		musicFile[currentTrack].currentTime = 0;
		this.updateVolume();
		musicFile[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		musicFile[0].pause();
		musicFile[0].currentTime = 0;
		musicFile[1].pause();
		musicFile[1].currentTime = 0;
	}

	this.resume = function() {
		musicFile[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		musicFile[0].pause();
		musicFile[1].pause();
	}

	this.playFrom = function(time) {
		this.setTime(time);
		musicFile[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				currentTrack++;
				if (currentTrack > 1) {currentTrack = 0;}
				this.play();
			}
		}
	}

	this.updateVolume = function() {
		musicFile[0].volume = Math.pow(mixVolume * musicVolume  * trackVolume * !isMuted, 2);
		musicFile[1].volume = Math.pow(mixVolume * musicVolume  * trackVolume * !isMuted, 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile[currentTrack].volume = Math.pow(mixVolume * newVolume * musicVolume * !isMuted, 2);
		trackVolume = newVolume;
		if (trackVolume <= 0) { this.stop();}
	}

	this.getVolume = function() {
		return trackVolume * !isMuted;
	}

	this.setMixVolume = function(volume) {
		mixVolume = volume;
	}

	this.getSourceTrack = function() {
		return this;
	}

	this.setTime = function(time) {
		var newTime = time;
		while (newTime >= duration) {newTime -= duration;}
		if(newTime < 0) {newTime = 0;}
		musicFile[currentTrack].currentTime = newTime;
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicFile[currentTrack].currentTime;
	}
	
	this.setTrackName = function(name) {
		trackName = name;
	}

	this.getTrackName = function() {
		return trackName;
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return musicFile[currentTrack].paused;
	}

	return this;
}

function musicContainer(trackList) {//Basic containers
	var musicTrack = [];
	var currentTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
	}

	this.trigger = function(callSign) {

	}

	this.setCurrentTrack = function(trackNumber) {
		currentTrack = trackNumber;
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerRandom(trackList) {//Picks random list-item to play on play
	var musicTrack = [];
	var currentTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		currentTrack = Math.floor(Math.random() * musicTrack.length);
		musicTrack[currentTrack].play();
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		currentTrack = Math.floor(Math.random() * musicTrack.length);
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
	}

	this.trigger = function(callSign) {
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerLoop(trackList) {//Loops current list-item
	var musicTrack = [];
	var currentTrack = 0;
	var schedualedTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		if (currentTrack != schedualedTrack) {
			currentTrack = schedualedTrack;
		}
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if (callSign == "cue") {
				this.play();
			}
		}
	}

	this.setCurrentTrack = function(trackNumber) {
		schedualedTrack = trackNumber;
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerLoopRandom(trackList) {//Picks new random list-item to play every loop
	var musicTrack = [];
	var currentTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				currentTrack = Math.floor(Math.random() * musicTrack.length);
				this.play();
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerLoopRandomRepetitionControl(trackList, maxRepetitions = 3, minRepetitions = 1) {//Picks new random list-item to play every loop
	var musicTrack = [];
	var currentTrack = 0;
	var lastTrack = 0;
	var playCountdown = 0;
	var playMax = maxRepetitions;
	var playMin = minRepetitions;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		lastTrack = currentTrack;
		playCountdown--;
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				if (playCountdown <= 0 && musicTrack.length > 1){
					while(currentTrack == lastTrack) {
						currentTrack = Math.floor(Math.random() * musicTrack.length);
					}
					playCountdown = Math.floor(Math.random() * (playMax - playMin + 1) + playMin);
				}
				this.play();
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerLoopRandomDurationControl(trackList, maxDurationInSeconds = 180, minDurationInSeconds = 60) {//Picks new random list-item to play every loop
	var musicTrack = [];
	var lastTrack = 0;
	var playTime = 0;
	var playMax = maxDurationInSeconds;
	var playMin = minDurationInSeconds;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		lastTrack = currentTrack;
		playTime += musicTrack[currentTrack].getDuration();
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				if (playTime > playMin && musicTrack.length > 1){
					if(Math.random() <= (playTime - playMin)/(playMax - playMin)) {
						while(currentTrack == lastTrack) {
							currentTrack = Math.floor(Math.random() * musicTrack.length);
						}
						playTime = 0;
					}
				}
				this.play();
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerConcatenated(trackList) {//Reports all list-items as one item and plays through them
	var musicTrack = [];
	var currentTrack = 0;
	var duration = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
		duration += musicTrack[i].getDuration();
	}

	var trackVolume = 1;


	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "secret cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		currentTrack = 0;
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "secret cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		var totalTime = time;
		var notFound = true;
		for (var i in musicTrack) {
			if (musicTrack[i].getDuration() > totalTime && notFound) {
				totalTime -= musicTrack[i].getDuration();
			} else if (musicTrack[i].getDuration() <= totalTime && notFound) {
				currentTrack = i;
				notFound = false;
			}
		}
		musicTrack[currentTrack].playFrom(totalTime);
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "secret cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "secret cue") {
				currentTrack++;
				if (currentTrack < musicTrack.length) {
					this.play();
				} else {
					currentTrack = 0;
				}
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		var totalTime = time;
		for (var i in musicTrack) {
			if (musicTrack[i].getDuration() > totalTime) {
				totalTime -= musicTrack[i].getDuration();
			} else if (musicTrack[i].getDuration() <= totalTime) {
				currentTrack = i;
				musicTrack[currentTrack].setTime(totalTime);
				return;
			}
		}
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "secret cue");
	}

	this.getTime = function() {
		var totalTime = 0;
		for (var i in musicTrack) {
			if (i < currentTrack) {
				totalTime += musicTrack[i].getDuration();
			} else if (i == currentTrack) {
				totalTime += musicTrack[i].getTime();
			}
		}
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerConcatenatedLatchLast(trackList) {//Reports all list-items as one item, but only repeats last one
	var musicTrack = [];
	var currentTrack = 0;
	var duration = 0;
	var atEnd = false;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
		duration += musicTrack[i].getDuration();
	}

	var trackVolume = 1;


	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		if (!atEnd) {
			currentTrack = 0;
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		if (atEnd) {
			musicTrack[currentTrack].playFrom(time);
			AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
		} else {
			var totalTime = time;
			var notFound = true;
			for (var i in musicTrack) {
				if (musicTrack[i].getDuration() > totalTime && notFound) {
					totalTime -= musicTrack[i].getDuration();
				} else if (musicTrack[i].getDuration() <= totalTime && notFound) {
					currentTrack = i;
					notFound = false;
				}
			}
			musicTrack[currentTrack].playFrom(totalTime);
			AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
		}
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				if (currentTrack < musicTrack.length - 1) {
					currentTrack++;
				} 
				if (currentTrack >= musicTrack.length - 1) {
					atEnd = true;
				}
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
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
		if (currentTrack >= slot) {currentTrack--;}

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
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		if (atEnd) {
			musicTrack[currentTrack].setTime(time);
		} else {
			var totalTime = time;
			for (var i in musicTrack) {
				if (musicTrack[i].getDuration() > totalTime) {
					totalTime -= musicTrack[i].getDuration();
				} else if (musicTrack[i].getDuration() <= totalTime) {
					currentTrack = i;
					musicTrack[currentTrack].setTime(totalTime);
					AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
					return;
				}
			}
		}
	}

	this.getTime = function() {
		var totalTime = 0;
		if (atEnd) {
			totalTime = musicTrack[currentTrack].getTime();
		} else {
			for (var i in musicTrack) {
				if (i < currentTrack) {
					totalTime += musicTrack[i].getDuration();
				} else if (i == currentTrack) {
					totalTime += musicTrack[i].getTime();
				}
			}
		}
		return totalTime;
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		if (atEnd) {
			return musicTrack[currentTrack].getDuration();
		} else {
			return duration;
		}
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerConcatenatedLoop(trackList) {//Loops list-items as if one item
	var musicTrack = [];
	var currentTrack = 0;
	var duration = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
		duration += musicTrack[i].getDuration();
	}

	var trackVolume = 1;


	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		currentTrack = 0;
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		var totalTime = time;
		var notFound = true;
		for (var i in musicTrack) {
			if (musicTrack[i].getDuration() > totalTime && notFound) {
				totalTime -= musicTrack[i].getDuration();
			} else if (musicTrack[i].getDuration() <= totalTime && notFound) {
				currentTrack = i;
				notFound = false;
			}
		}
		musicTrack[currentTrack].playFrom(totalTime);
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				currentTrack++;
				if (currentTrack < musicTrack.length) {
					this.play();
				} else {
					currentTrack = 0;
					this.play();
				}
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		var totalTime = time;
		for (var i in musicTrack) {
			if (musicTrack[i].getDuration() > totalTime) {
				totalTime -= musicTrack[i].getDuration();
			} else if (musicTrack[i].getDuration() <= totalTime) {
				currentTrack = i;
				musicTrack[currentTrack].setTime(totalTime);
				AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
				return;
			}
		}
	}

	this.getTime = function() {
		var totalTime = 0;
		for (var i in musicTrack) {
			if (i < currentTrack) {
				totalTime += musicTrack[i].getDuration();
			} else if (i == currentTrack) {
				totalTime += musicTrack[i].getTime();
			}
		}
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return duration;
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerConcatenatedLoopLast(trackList) {//Loop all list-items as one item, but only repeats last one
	var musicTrack = [];
	var currentTrack = 0;
	var duration = 0;
	var atEnd = false;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
		duration += musicTrack[i].getDuration();
	}

	var trackVolume = 1;


	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
		if (!atEnd) {
			currentTrack = 0;
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		if (atEnd) {
			musicTrack[currentTrack].playFrom(time);
			AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
		} else {
			var totalTime = time;
			var notFound = true;
			for (var i in musicTrack) {
				if (musicTrack[i].getDuration() > totalTime && notFound) {
					totalTime -= musicTrack[i].getDuration();
				} else if (musicTrack[i].getDuration() <= totalTime && notFound) {
					currentTrack = i;
					notFound = false;
				}
			}
			musicTrack[currentTrack].playFrom(totalTime);
			AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "cue");
		}
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "secret cue") {
				if (currentTrack < musicTrack.length - 1) {
					currentTrack++;
				} 
				if (currentTrack >= musicTrack.length - 1) {
					atEnd = true;
				}
				this.play();
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}

		duration = 0;
		for (var i in musicTrack) {
			duration += musicTrack[i].getDuration();
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
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
		if (currentTrack >= slot) {currentTrack--;}

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
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		if (atEnd) {
			musicTrack[currentTrack].setTime(time);
		} else {
			var totalTime = time;
			for (var i in musicTrack) {
				if (musicTrack[i].getDuration() > totalTime) {
					totalTime -= musicTrack[i].getDuration();
				} else if (musicTrack[i].getDuration() <= totalTime) {
					currentTrack = i;
					musicTrack[currentTrack].setTime(totalTime);
					AudioEventManager.addTimerEvent(this, (musicTrack[currentTrack].getDuration() - musicTrack[currentTrack].getTime()), "secret cue");
					return;
				}
			}
		}
	}

	this.getTime = function() {
		var totalTime = 0;
		if (atEnd) {
			totalTime = musicTrack[currentTrack].getTime();
		} else {
			for (var i in musicTrack) {
				if (i < currentTrack) {
					totalTime += musicTrack[i].getDuration();
				} else if (i == currentTrack) {
					totalTime += musicTrack[i].getTime();
				}
			}
		}
		return totalTime;
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		if (atEnd) {
			return musicTrack[currentTrack].getDuration();
		} else {
			return duration;
		}
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerCrossfade(trackList) {//Can crossfade between list-items
	var musicTrack = [];
	var currentTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].setVolume(0)
		musicTrack[i].pause();
	}
	musicTrack[0].setVolume(1);

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
	}

	this.trigger = function(callSign) {
	}

	this.switchTo = function(slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack != slot && !musicTrack[currentTrack].getPaused()) {
			musicTrack[slot].playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(musicTrack[slot], fadeTime, trackVolume);
			currentTrack = slot;
		} else if (currentTrack != slot) {
			musicTrack[slot].setTime(timeNow);
			musicTrack[currentTrack].stop();
			currentTrack = slot;
			musicTrack[currentTrack].setVolume(trackVolume);
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerCrossfadeLoop(trackList) {//Can crossfade between list-items, loops current item
	var musicTrack = [];
	var currentTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].setVolume(0)
		musicTrack[i].pause();
	}
	musicTrack[0].setVolume(1);

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if (callSign == "cue") {
				this.play();
			}
		}
	}

	this.switchTo = function(slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack != slot && !musicTrack[currentTrack].getPaused()) {
			musicTrack[slot].playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(musicTrack[slot], fadeTime, trackVolume);
			currentTrack = slot;
			AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
		} else if (currentTrack != slot) {
			musicTrack[slot].setTime(timeNow);
			musicTrack[currentTrack].stop();
			currentTrack = slot;
			musicTrack[currentTrack].setVolume(trackVolume);
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerLayers(trackList) {//Plays all list-items together, controls volumes
	var musicTrack = [];
	var musicTrackVolume = [];
	var trackVolume = 1;
	var currentTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
		musicTrackVolume[i] = 1;
		musicTrack[i].setVolume(1);
	}

	function evaluateCurrentTrack(){
		var trackNow = 0;
		for(var i = musicTrack.length-1; i >= 0; i--) {
			if (!musicTrack[i].getPaused()) {
				trackNow = i;
			}
		}
		currentTrack = trackNow;
	}

	this.play = function() {
		for (var i in musicTrack) {
			if (musicTrackVolume[i] > 0) {
				musicTrack[i].play();
			}
		}
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		for (var i in musicTrack) {
			if (musicTrackVolume[i] > 0) {
				musicTrack[i].resume();
			}
		}
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		for (var i in musicTrack) {
			musicTrack[i].playFrom(time);
		}
	}

	this.trigger = function(callSign) {
	}

	this.setLayerLevel = function(slot, level, fadeTime = 1) {
		musicTrackVolume[slot] = level;
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
				musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
				musicTrack[slot].playFrom(timeNow);
			} else {
				musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			}
		} else {
			AudioEventManager.addFadeEvent(musicTrack[slot], fadeTime, musicTrackVolume[slot] * trackVolume);
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack.getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) { //Needs a look
		evaluateCurrentTrack();
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[slot], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, musicTrackVolume[slot] *  trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
		musicTrackVolume.push(0);
		newTrack.setVolume(0);
	}

	this.removeTrack = function(slot) {
		evaluateCurrentTrack();
		musicTrack.splice(slot,1);
		musicTrackVolume.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (var i in musicTrack) {
			musicTrack[i].setVolume(musicTrackVolume[i] * trackVolume);
		}
	}

	this.getVolume = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		evaluateCurrentTrack();
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		for (var i in musicTrack) {
			musicTrack[i].setTime(time);
		}
	}

	this.getTime = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		evaluateCurrentTrack();
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}//Still some problems if you set all layers to 0

function musicContainerLayersLoop(trackList) {//Plays all list-items together, controls volumes, loops
	var musicTrack = [];
	var musicTrackVolume = [];
	var trackVolume = 1;
	var currentTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
		musicTrackVolume[i] = 1;
		musicTrack[i].setVolume(1);
	}

	function evaluateCurrentTrack(){
		var trackNow = 0;
		for(var i = musicTrack.length-1; i >= 0; i--) {
			if (!musicTrack[i].getPaused()) {
				trackNow = i;
			}
		}
		currentTrack = trackNow;
	}

	function tracksToPlay() {
		for(var i in musicTrackVolume) {
			if(musicTrackVolume[i] > 0) {
				return true;
			}
		}
		return false;
	}

	this.play = function() {
		// if (!tracksToPlay()) {  //Should set the first track to play if all volumes are down, but doesnt
		// 	musicTrackVolume[0] = 1;
		// 	musicTrack[0].setVolume(1);
		// }
		for (var i in musicTrack) {
			if (musicTrackVolume[i] > 0) {
				musicTrack[i].play();
			}
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		for (var i in musicTrack) {
			if (musicTrackVolume[i] > 0) {
				musicTrack[i].resume();
			}
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		for (var i in musicTrack) {
			musicTrack[i].playFrom(time);
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				if(tracksToPlay()) {
					this.play();
				}
			}
		}
	}

	this.setLayerLevel = function(slot, level, fadeTime = 1) {
		musicTrackVolume[slot] = level;
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
				musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
				musicTrack[slot].playFrom(timeNow);
			} else {
				musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			}
		} else {
			AudioEventManager.addFadeEvent(musicTrack[slot], fadeTime, musicTrackVolume[slot] * trackVolume);
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack.getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) { //Needs a look
		evaluateCurrentTrack();
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[slot], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, musicTrackVolume[slot] *  trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(musicTrackVolume[slot] * trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
		musicTrackVolume.push(0);
		newTrack.setVolume(0);
	}

	this.removeTrack = function(slot) {
		evaluateCurrentTrack();
		musicTrack.splice(slot,1);
		musicTrackVolume.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		for (var i in musicTrack) {
			musicTrack[i].setVolume(musicTrackVolume[i] * trackVolume);
		}
	}

	this.getVolume = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		evaluateCurrentTrack();
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		for (var i in musicTrack) {
			musicTrack[i].setTime(time);
		}
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		evaluateCurrentTrack();
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		evaluateCurrentTrack();
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}//Still some problems if you set all layers to 0

function musicContainerSequence(trackList) {//Plays list-items in order
	var musicTrack = [];
	var currentTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				currentTrack++;
				if (currentTrack >= musicTrack.length) {
					currentTrack = 0;
				}
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerSequenceLatch(trackList) {//Plays list-items in order, but stays on current one until indicated
	var musicTrack = [];
	var currentTrack = 0;
	var latched = true;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.continue = function() {
		latched = false;
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				if (!latched) {
					currentTrack++;
					latched = true;
				}
				if (currentTrack >= musicTrack.length) {currentTrack = 0;}
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerSequenceLatchLast(trackList) {//Plays list-items in order, stays on last item
	var musicTrack = [];
	var currentTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				if (currentTrack < musicTrack.length - 1) {
					currentTrack++;
				}
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerPlaylist(trackList) {//Plays through list-items in order
	var musicTrack = [];
	var currentTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				currentTrack++;
				if (currentTrack < musicTrack.length) {
					this.play();
				} else {
					currentTrack = 0;
				}
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerPlaylistLoop(trackList) {//Loops through list-items in order
	var musicTrack = [];
	var currentTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				currentTrack++;
				if (currentTrack >= musicTrack.length) {currentTrack = 0;}
				this.play();
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerPlaylistLoopLatch(trackList) {//Plays through list-items in order, but loops current one until indicated
	var musicTrack = [];
	var currentTrack = 0;
	var latched = true;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.continue = function() {
		latched = false;
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				if (!latched) {
					currentTrack++;
					latched = true;
				}
				if (currentTrack >= musicTrack.length) {currentTrack = 0;}
				this.play();
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}

function musicContainerPlaylistLoopLast(trackList) {//Plays through list-items in order, loops last item
	var musicTrack = [];
	var currentTrack = 0;

	for (var i in trackList) {
		musicTrack[i] = trackList[i];
		musicTrack[i].pause();
	}

	var trackVolume = 1;

	this.play = function() {
		musicTrack[currentTrack].play();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.stop = function() {
		for (var i in musicTrack) {
			musicTrack[i].stop();
		}
	}

	this.resume = function() {
		musicTrack[currentTrack].resume();
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.pause = function() {
		for (var i in musicTrack) {
			musicTrack[i].pause();
		}
	}

	this.playFrom = function(time) {
		musicTrack[currentTrack].playFrom(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.trigger = function(callSign) {
		if (!this.getPaused()) {
			if(callSign == "cue") {
				if (currentTrack < musicTrack.length - 1) {
					currentTrack++;
				}
				this.play();
			}
		}
	}

	this.loadTrack = function(newTrack, slot) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(!musicTrack[slot].getPaused()) {
			musicTrack[slot].pause();
			musicTrack[slot].setTime(0);
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].playFrom(timeNow);
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.loadTrackWithCrossfade = function(newTrack, slot, fadeTime = 1) {
		var timeNow = musicTrack[currentTrack].getTime();
		if(currentTrack == slot && !musicTrack[currentTrack].getPaused()) {
			newTrack.playFrom(timeNow);
			AudioEventManager.addCrossfadeEvent(musicTrack[currentTrack], fadeTime, 0);
			AudioEventManager.addCrossfadeEvent(newTrack, fadeTime, trackVolume);
			musicTrack[slot] = newTrack;
		} else {
			musicTrack[slot] = newTrack;
			musicTrack[slot].setVolume(trackVolume);
			musicTrack[slot].setTime(timeNow);
		}
	}

	this.addTrack = function(newTrack) {
		musicTrack.push(newTrack);
	}

	this.removeTrack = function(slot) {
		musicTrack.splice(slot,1);
		if (currentTrack >= slot) {currentTrack--;}
	}

	this.updateVolume = function() {
		for (var i in musicTrack) {
			musicTrack[i].updateVolume();
		}
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack[currentTrack].setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack[currentTrack].getVolume();
	}

	this.getCurrentTrack = function() {
		 return currentTrack;
	}

	this.getListLength = function() {
		 return musicTrack.length;
	}

	this.getSourceTrack = function() {
		return musicTrack[currentTrack].getSourceTrack();
	}

	this.setTime = function(time) {
		musicTrack[currentTrack].setTime(time);
		AudioEventManager.addTimerEvent(this, (this.getDuration() - this.getTime()), "cue");
	}

	this.getTime = function() {
		return musicTrack[currentTrack].getTime();
	}
	
	this.setTrackName = function(name) {
		musicTrack[currentTrack].setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack[currentTrack].getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack[currentTrack].getDuration();
	}

	this.getPaused = function() {
		return musicTrack[currentTrack].getPaused();
	}

	return this;
}
