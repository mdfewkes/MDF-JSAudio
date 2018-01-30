setFormat();
isMuted = false;

//set sound clips and music tracks here
var track1 = new musicTrackLooping("../Audio/Layer1");
var track2 = new musicTrackLooping("../Audio/Layer2");
var backgroundMusic = new musicContainer(track1);

var clip1 = new sfxClip("../Audio/Death");

track1.setTrackName("track1");
track2.setTrackName("track2");






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
}

function setMute(TorF) {
	isMuted = TorF;
}

function getMute(TorF) {
	return isMuted;
}