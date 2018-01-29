

if(musicVolume === null){
	musicVolume = 1;
}


// Holds a music file with data and functions.  Supports files with tails
function musicTrack(filenameWithPath, hasTail, duration) {
	musicFile = new Audio(filenameWithPath + audioFormat);
	this.musicTail = hasTail;
	musicDuration = duration;
	this.trackName = filenameWithPath;
	if (musicDuration == null) {
		musicDuration = musicFile.duration;
	}
	this.setVolume(musicVolume);

	this.playTrack = function() {
		musicFile.currentTime = 0;
		musicFile.play();
	}

	this.stopTrack = function() {
		musicFile.pause();
		musicFile.currentTime = 0;
	}

	this.resumeTrack = function() {
		musicFile.play();
	}

	this.pauseTrack = function() {
		musicFile.pause();
	}

	this.playTrackFrom = function(time) {
		musicFile.currentTime = time;
		musicFile.play();
	}

	this.setTime = function(time) {
		musicFile.currentTime = time;
	}

	this.getTime = function() {
		return musicFile.currentTime;
	}

	this.setVolume = function(volume) {
		// Multipliction by a boolean serves as 1 for true and 0 for false
		musicSound.volume = Math.pow(volume * !isMuted, 2);
		
		if(musicSound.volume == 0) {
			musicSound.pause();
		} else if (musicSound.paused) {
			musicSound.play();
		}
	}

	this.setPlaybackRate = function(rate) {
		musicFile.playbackRate = rate;
	}

	this.getPaused = function() {
		return musicFile.paused;
	}

}

//A player for 
function musicLoopClass() {

    let musicSound = null;
	
    this.loopSong = function(musicTrack) {
        setFormat(); // calling this to ensure that audioFormat is set before needed

        if (musicSound != null) {
            musicSound.pause();
            musicSound = null;
        }
        musicSound = new musicTrack;
        if (!musicSound.musicTail) {
        	musicSound.loop = true;
        } else {
        	musicSound.loop = false;
        	console.log(musicSound.trackName + " is not formated as a looping track.");
        }
        this.setVolume(musicVolume);
    }

    this.pauseSound = function() {
        musicSound.pauseTrack();
    }

    this.resumeSound = function() {
        musicSound.resumeTrack();
    }
	
	this.setVolume = function(volume) {
		// Multipliction by a boolean serves as 1 for true and 0 for false
		musicSound.volume = Math.pow(volume * !isMuted, 2);
		
		if(musicSound.volume == 0) {
			musicSound.pauseTrack();
		} else if (musicSound.getPaused()) {
			musicSound.resumeTrack();
		}
	}
}

function setMusicVolume(amount){
	musicVolume = amount;
	if(musicVolume > 1.0) {
		musicVolume = 1.0;
	} else if (musicVolume < 0.0) {
		musicVolume = 0.0;
	}
	currentBackgroundMusic.setVolume(musicVolume);
}