var musicVolume = 1;
var isMuted = false;

function setMusicVolume(amount) {
	musicVolume = amount;
}

function getMusicVolume() {
	return musicVolume;
}

function musicTrackLooping(filenameWithPath) {
	var musicFile = new Audio(filenameWithPath+audioFormat);
	var duration = musicFile.duration;
	var trackName = filenameWithPath;
	var trackVolume = 1;
	
	musicFile.pause();
	musicFile.loop = true;

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
		musicFile.currentTime = time;
		musicFile.play();
	}

	this.startOrStop = function() {
		if(musicFile.paused) {
			this.resume();
		} else {
			this.pause();
		}
	}

	this.updateVolume = function() {
		musicFile.volume = Math.pow(musicVolume  * trackVolume * !isMuted, 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile.volume = Math.pow(newVolume * musicVolume * !isMuted, 2);
		trackVolume = newVolume;
	}

	this.getVolume = function() {
		return trackVolume * !isMuted;
	}

	this.setTime = function(time) {
		musicFile.currentTime = time;
	}

	this.getTime = function() {
		return musicFile.currentTime;
	}

	this.setPlaybackRate = function(rate) {
		musicFile.playbackRate = rate;
	}

	this.getPlaybackRate = function() {
		return musicFile.playbackRate;
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
}

function musicTrackLoopingWTail(filenameWithPath, playLength) {
	var musicFile = new Array(new Audio(filenameWithPath+audioFormat), new Audio(filenameWithPath+audioFormat));
	var currentTrack = 0;
	var duration = playLength;
	var trackName = filenameWithPath;
	var trackVolume = 1;
	
	musicFile[0].pause();
	musicFile[1].pause();

	this.play = function() {
		musicFile[currentTrack].currentTime = 0;
		this.updateVolume();
		musicFile[currentTrack].play();
		musicManager.addLoopEvent(this);
	}

	this.stop = function() {
		musicFile[0].pause();
		musicFile[0].currentTime = 0;
		musicFile[1].pause();
		musicFile[1].currentTime = 0;
	}

	this.resume = function() {
		musicFile[currentTrack].play();
		musicManager.addLoopEvent(this);
	}

	this.pause = function() {
		musicFile[0].pause();
		musicFile[1].pause();
	}

	this.playFrom = function(time) {
		musicFile[currentTrack].currentTime = time;
		musicFile[currentTrack].play();
	}

	this.startOrStop = function() {
		if(musicFile.paused) {
			this.resume();
		} else {
			this.pause();
		}
	}

	this.triggerLoopEnded = function() {
		currentTrack++;
		if (currentTrack > 1) {currentTrack = 0;}
		this.play();
		console.log("Trigger loop ended for " + this.getTrackName());
	}

	this.updateVolume = function() {
		musicFile[0].volume = Math.pow(musicVolume  * trackVolume * !isMuted, 2);
		musicFile[1].volume = Math.pow(musicVolume  * trackVolume * !isMuted, 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile[currentTrack].volume = Math.pow(newVolume * musicVolume * !isMuted, 2);
		trackVolume = newVolume;
	}

	this.getVolume = function() {
		return trackVolume * !isMuted;
	}

	this.setTime = function(time) {
		musicFile[currentTrack].currentTime = time;
	}

	this.getTime = function() {
		return musicFile[currentTrack].currentTime;
	}

	this.setPlaybackRate = function(rate) {
		musicFile[0].playbackRate = rate;
		musicFile[1].playbackRate = rate;
	}

	this.getPlaybackRate = function() {
		return musicFile[currentTrack].playbackRate;
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
}

function musicTrackStinger(filenameWithPath) {
	var musicFile = new Audio(filenameWithPath+audioFormat);
	var duration = musicFile.duration;
	var trackName = filenameWithPath;
	var trackVolume = 1;
	
	musicFile.pause();
	musicFile.loop = false;

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
		musicFile.currentTime = time;
		musicFile.play();
	}

	this.startOrStop = function() {
		if(musicFile.paused) {
			this.resume();
		} else {
			this.pause();
		}
	}

	this.updateVolume = function() {
		musicFile.volume = Math.pow(musicVolume  * trackVolume * !isMuted, 2);
	}

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile.volume = Math.pow(newVolume * musicVolume * !isMuted, 2);
		trackVolume = newVolume;
	}

	this.getVolume = function() {
		return trackVolume * !isMuted;
	}

	this.setTime = function(time) {
		musicFile.currentTime = time;
	}

	this.getTime = function() {
		return musicFile.currentTime;
	}

	this.setPlaybackRate = function(rate) {
		musicFile.playbackRate = rate;
	}

	this.getPlaybackRate = function() {
		return musicFile.playbackRate;
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
}

function musicContainer(track) {
	var musicTrack = track;
	var trackVolume = 1;

	this.play = function() {
		musicTrack.play();
	}

	this.stop = function() {
		musicTrack.stop();
	}

	this.resume = function() {
		musicTrack.resume();
	}

	this.pause = function() {
		musicTrack.pause();
	}

	this.playFrom = function(time) {
		musicTrack.playFrom(time);
	}

	this.startOrStop = function() {
		musicTrack.startOrStop();
	}

	this.loadTrack = function(newTrack) {
		timeNow = musicTrack.getTime();
		if(!musicTrack.getPaused()) {
			musicTrack.pause();
			musicTrack.setTime(0);
			musicTrack = newTrack;
			musicTrack.setVolume(trackVolume);
			musicTrack.playFrom(timeNow);
		} else {
			musicTrack = newTrack;
			musicTrack.setVolume(trackVolume);
			musicTrack.setTime(timeNow);
		}
	}

	this.updateVolume = function() {
		musicTrack.updateVolume();
	}

	this.setVolume = function(newVolume) {
		trackVolume = newVolume;
		musicTrack.setVolume(newVolume);
	}

	this.getVolume = function() {
		return musicTrack.getVolume();
	}

	this.setTime = function(time) {
		musicTrack.setTime(time);
	}

	this.getTime = function() {
		return musicTrack.getTime();
	}

	this.setPlaybackRate = function(rate) {
		musicTrack.setPlaybackRate(rate);
	}

	this.getPlaybackRate = function() {
		return musicTrack.getPlaybackRate();
	}
	
	this.setTrackName = function(name) {
		musicTrack.setTrackName(name);
	}

	this.getTrackName = function() {
		return musicTrack.getTrackName();
	}
	
	this.getDuration = function() {
		return musicTrack.getDuration();
	}

	this.getPaused = function() {
		return musicTrack.getPaused();
	}
}

