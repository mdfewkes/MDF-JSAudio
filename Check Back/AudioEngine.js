include "MusicClasses.js"
include "SoundFXClasses.js"

var audioFormat;
const VOLUME_INCREMENT = 0.05;
var isMuted = false;

setFormat();

function setFormat() {
    var audio = new Audio();
    if (audio.canPlayType("audio/ogg")) {
        audioFormat = ".ogg";
    } else {
        audioFormat = ".mp3";
    }
}

function toggleMute() {
	isMuted = !isMuted;
	currentBackgroundMusic.setVolume(musicVolume);
}

function turnVolumeUp() {
	setMusicVolume(musicVolume + VOLUME_INCREMENT);
	setEffectsVolume(effectsVolume + VOLUME_INCREMENT);
}

function turnVolumeDown() {
	setMusicVolume(musicVolume - VOLUME_INCREMENT);
	setEffectsVolume(effectsVolume - VOLUME_INCREMENT);
}