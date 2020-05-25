
var musicVolume = 0.7;
var effectsVolume = 0.7;
var isMuted = false;
const VOLUME_INCREMENT = 0.0333;


//define sounds



//sound classes

var backgroundMusic = function backgroundMusicClass() {

	var musicSound = null;
	var fadeTrack = null;

	this.trackName = "";
	get playing() {
		return !musicSound.paused;
	}

	this.loopSong = function(filenameWithPath) {
		var newTrack = new Audio(filenameWithPath);
		newTrack.oncanplaythrough = function() {
			if (musicSound != null && fadeTrack != null) {
				fadeTrack.pause();
				fadeTrack = musicSound;
				musicSound = null;
			} else if (musicSound != null) {
				fadeTrack = musicSound;
				musicSound = null;
			}
			musicSound = newTrack;
			musicSound.loop = true;
			this.setVolume(musicVolume);

			if (fadeTrack != null) {
				fadeTrack.ontimeupdate = function() {
					var newVolume = fadeTrack.volume - VOLUME_INCREMENT;

					if(newVolume > 1.0) {newVolume = 1.0;}

					if (newVolume < 0.015) {
						fadeTrack.pause();
						fadeTrack = null;
					} else {
						fadeTrack.volume = newVolume;
					}
				}
			}
		}
	}

	this.pause = function() {
		musicSound.pause();
		fadeTrack.pause();
		fadeTrack = null;
	}

	this.stop = function() {
		musicSound.pause();
		if (fadeTrack != null) {
			fadeTrack.pause();
			fadeTrack = null;
		}

		musicSound.currentTime = 0;
	}

	this.resume = function() {
		musicSound.play();
	}

	this.setVolume = function(value) {
		// Multipliction by a boolean serves as 1 for true and 0 for false
		if (musicSound == null) {return;}

		musicSound.volume = Math.pow(value * !isMuted, 2);

		if(musicSound.volume == 0) {
			musicSound.pause();
		} else if (musicSound.paused) {
			musicSound.play();
		}
	}
}

function soundLoopsClass(filenameWithPath) {

	var fullFilename = filenameWithPath;
	var sound = new Audio(fullFilename);
	sound.loop = true;

	this.play = function() {
		if (sound.paused) {
			sound.currentTime = 0;
			sound.volume = Math.pow(getRandomVolume() * effectsVolume * !isMuted, 2);
			sound.play();
		}
	}

	this.stop = function() {
		sound.pause();
	}
}

function soundOverlapsClass(filenameWithPath) {

	var fullFilename = filenameWithPath;
	var soundIndex = 0;
	var sounds = [new Audio(fullFilename), new Audio(fullFilename)];

	this.play = function() {
		if(!sounds[soundIndex].paused) {
			sounds.splice(soundIndex, 0, new Audio(fullFilename));
		}

		sounds[soundIndex].currentTime = 0;
		sounds[soundIndex].volume = Math.pow(getRandomVolume() * effectsVolume * !isMuted, 2);
		sounds[soundIndex].play();

		soundIndex = (++soundIndex) % sounds.length;
	}
}

function soundRandomClass(arrayOfFilenames) {
	var soundIndex = 0;
	var sounds = [''];

	for (var i = 0; i < arrayOfFilenames.length; i++) {
		sounds[i] = new Audio(arrayOfFilenames[i]);
		sounds[i+arrayOfFilenames.length] = new Audio(arrayOfFilenames[i]);
	}

	this.play = function() {
		soundIndex = rndInt(0, sounds.length - 1);
		if(!sounds[soundIndex].paused) {
			soundIndex++;
			if (soundIndex >= sounds.length) {
				soundIndex = 0;
			}
		}

		sounds[soundIndex].currentTime = 0;
		sounds[soundIndex].volume = Math.pow(getRandomVolume() * effectsVolume * !isMuted, 2);
		sounds[soundIndex].play();
	}
}

//sound functions
function getRandomVolume(){
	var min = 0.8;
	var max = 1;
	var randomVolume = Math.random() * (max - min) + min;
	return randomVolume.toFixed(2);
}

function toggleMute() {
	isMuted = !isMuted;
	backgroundMusic.setVolume(musicVolume);
}

function setMusicVolume(amount) {
	musicVolume = amount;
	if(musicVolume > 1.0) {
		musicVolume = 1.0;
	} else if (musicVolume < 0.0) {
		musicVolume = 0.0;
	}
	backgroundMusic.setVolume(musicVolume);
}

function turnMusicVolumeUp() {
	setMusicVolume(musicVolume + VOLUME_INCREMENT);
}

function turnMusicVolumeDown() {
	setMusicVolume(musicVolume - VOLUME_INCREMENT);
}

function setEffectsVolume(amount) {
	effectsVolume = amount;
	if(effectsVolume > 1.0) {
		effectsVolume = 1.0;
	} else if (effectsVolume < 0.0) {
		effectsVolume = 0.0;
	}
}

function turnEffectsVolumeUp() {
	setEffectsVolume(effectsVolume + VOLUME_INCREMENT);
}

function turnEffectsVolumeDown() {
	setEffectsVolume(effectsVolume - VOLUME_INCREMENT);
}

function setVolume(amount) {
	setMusicVolume(amount);
	setEffectsVolume(amount);
}

function turnVolumeUp() {
	turnMusicVolumeUp();
	turnEffectsVolumeUp();
}

function turnVolumeDown() {
	turnMusicVolumeDown();
	turnEffectsVolumeDown();
}
