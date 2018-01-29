var audioFormat = ".ogg";

function setFormat() {
  var audio = new Audio();
  if (audio.canPlayType("audio/ogg")) {
      audioFormat = ".ogg";
  } else {
      audioFormat = ".mp3";
  }
}

function BackgroundMusicClass() {

  var musicSound = null;
    
  this.loopSong = function(filenameWithPath) {
    setFormat(); // calling this to ensure that audioFormat is set before needed
    
    if(musicSound != null) {
      musicSound.pause();
      musicSound = null;
    }
    musicSound = new Audio(filenameWithPath+audioFormat);
    musicSound.loop = true;
    musicSound.play();
  }
  
  this.startOrStopMusic = function() {
    if(musicSound.paused) {
      musicSound.resume();
    } else {
      musicSound.pause();
    }
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

	this.setVolume = function(volume) {
		// Multipliction by a boolean serves as 1 for true and 0 for false
		musicFile.volume = Math.pow(volume * !isMuted, 2);
		
		if(musicFile.volume >= 0.01) {
			this.pause();
		} else if (musicFile.paused) {
			this.resume();
		}
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
			musicTrack.playFrom(timeNow);
		} else {
			musicTrack = newTrack;
			musicTrack.setTime(timeNow);
		}
	}

	this.setVolume = function(volume) {
		musicTrack.setVolume = volume;
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