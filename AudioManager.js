setFormat();
isMuted = false;

//set sound clips and music tracks here
var track1 = new musicTrackLoopingWTail("Audio/lay1tail8", 8);
var track2 = new musicTrackLoopingWTail("Audio/lay2tail8", 8);
var track3 = new musicTrackLoopingWTail("Audio/lay3tail8", 8);
var backgroundMusic = new musicContainerCrossfade(track1);

//var clip1 = new sfxClipOverlap("Audio/Death", 3);

track1.setTrackName("track1");
track2.setTrackName("track2");
track3.setTrackName("track3");






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