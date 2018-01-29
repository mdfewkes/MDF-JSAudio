var sfxVolume = 1;
var isMuted = false;

function getRandomVolume(){
	var min = 0.85;
	var max = 1;
	var randomVolume = Math.random() * (max - min) + min;
	return randomVolume.toFixed(2);
}

function sfxClipOverlap(filenameWithPath) {
	setFormat();

	var fullFilename = filenameWithPath;
		var soundIndex = 0;
	var sounds = [new Audio(fullFilename + audioFormat), new Audio(fullFilename + audioFormat)];

	this.play = function() {
				if(!sounds[soundIndex].paused) {
					sounds.splice(soundIndex, 0, new Audio(fullFilename + audioFormat));
				}
		sounds[soundIndex].currentTime = 0;
		sounds[soundIndex].volume = Math.pow(getRandomVolume() * effectsVolume * !isMuted, 2);
		sounds[soundIndex].play();

		soundIndex = (++soundIndex) % sounds.length;
	}
}