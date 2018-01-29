

if(musicVolume === null){
	musicVolume = 1;
}

function setMusicVolume(amount)
{
	musicVolume = amount;
	if(musicVolume > 1.0) {
		musicVolume = 1.0;
	} else if (musicVolume < 0.0) {
		musicVolume = 0.0;
	}
}


function musicTrack(filenameWithPath) {
	var musicFile = new Audio(filenameWithPath+audioFormat);
	var duration = musicFile.duration;
	var trackName = filenameWithPath;

	musicFile.pause();
	musicFile.loop = true;

	this.play = function() {
		musicFile.currentTime = 0;
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
      		musicFile.play();
    	} else {
      		musicFile.pause();
    	}
    }

	this.setVolume = function(newVolume) {
		if(newVolume > 1) {newVolume = 1;}
		if(newVolume < 0) {newVolume = 0;}
		musicFile.volume = Math.pow(newVolume * musicVolume * !isMuted, 2);
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

function musicLoopSingle(track) {
	var musicTrack = track;
	var volume = 1;

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
			musicTrack.setVolume(volume);
			musicTrack.playFrom(timeNow);
		} else {
			musicTrack = newTrack;
			musicTrack.setVolume(volume);
			musicTrack.setTime(timeNow);
		}
	}

	this.setVolume = function(newVolume) {
		volume = newVolume;
		musicTrack.setVolume(newVolume);
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