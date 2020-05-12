//Constants--------------------------------------------------------------------
const VOLUME_INCREMENT = 0.1;
const CROSSFADE_TIME = 0.25;

function AudioGlobal() {

	var initialized = false;
	var audioCtx;
	var musicBus, soundEffectsBus, masterBus;
	var musicVolume, soundEffectsVolume;
	var currentMusicTrack;

//--//Set up WebAudioAPI nodes and load samples--------------------------------
	this.init = function() {
		if (initialized) return;

		//console.log("Initializing Audio...");
		// note: this causes a browser error if user has not interacted w page yet    
		audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		this.context = audioCtx;
		musicBus = audioCtx.createGain();
		soundEffectsBus = audioCtx.createGain();
		masterBus = audioCtx.createGain();

		musicVolume = 0.7;
		soundEffectsVolume = 0.7;

		musicBus.gain.value = musicVolume;
		soundEffectsBus.gain.value = soundEffectsVolume;
		musicBus.connect(masterBus);
		soundEffectsBus.connect(masterBus);
		masterBus.connect(audioCtx.destination);

		this.loadSample("audio/UI_01.mp3", function(buffer){genSounds.click1 = buffer;});
		this.loadSample("audio/UI_02.mp3", function(buffer){genSounds.click2 = buffer;});
		this.loadSample("audio/UI_03.mp3", function(buffer){genSounds.click3 = buffer;});
		this.loadSample("audio/UI_04.mp3", function(buffer){genSounds.click4 = buffer;});
		genSounds.playClick = function() { audio.playSound(randItem([genSounds.click1, genSounds.click2, 
																 genSounds.click3, genSounds.click4]), 1, 1)}
		this.loadSample("audio/Positive_01.mp3", function(buffer){genSounds.positive1 = buffer;});
		this.loadSample("audio/Positive_02.mp3", function(buffer){genSounds.positive2 = buffer;});
		this.loadSample("audio/Positive_03.mp3", function(buffer){genSounds.positive3 = buffer;});
		this.loadSample("audio/Positive_04.mp3", function(buffer){genSounds.positive4 = buffer;});
		genSounds.playPositive = function() { audio.playSound(randItem([genSounds.positive1, genSounds.positive2, 
																 genSounds.positive3, genSounds.positive4]), 1, 1)}
		this.loadSample("audio/Negative_01.mp3", function(buffer){genSounds.negative1 = buffer;});
		this.loadSample("audio/Negative_02.mp3", function(buffer){genSounds.negative2 = buffer;});
		this.loadSample("audio/Negative_03.mp3", function(buffer){genSounds.negative3 = buffer;});
		this.loadSample("audio/Negative_04.mp3", function(buffer){genSounds.negative4 = buffer;});
		genSounds.playNegative = function() { audio.playSound(randItem([genSounds.negative1, genSounds.negative2, 
																 genSounds.negative3, genSounds.negative4]), 1, 1)}

		this.loadSample("audio/PromptsAndAnswers/woman.mp3", function(buffer){promptSounds.woman = buffer;});
		this.loadSample("audio/PromptsAndAnswers/women.mp3", function(buffer){promptSounds.women = buffer;});
		this.loadSample("audio/PromptsAndAnswers/men.mp3", function(buffer){promptSounds.men = buffer;});
		this.loadSample("audio/PromptsAndAnswers/man.mp3", function(buffer){promptSounds.man = buffer;});
		this.loadSample("audio/PromptsAndAnswers/he.mp3", function(buffer){promptSounds.he = buffer;});
		this.loadSample("audio/PromptsAndAnswers/she.mp3", function(buffer){promptSounds.she = buffer;});

		this.loadSample("audio/PromptsAndAnswers/blendedCat.mp3", function(buffer){promptSounds.blendedCat = buffer;});
		this.loadSample("audio/PromptsAndAnswers/blendedCot.mp3", function(buffer){promptSounds.blendedCot = buffer;});

		this.loadSample("audio/PromptsAndAnswers/Mandarin/mandarinBuy.mp3", function(buffer){promptSounds.mandarinBuy = buffer;});
		this.loadSample("audio/PromptsAndAnswers/Mandarin/mandarinSell.mp3", function(buffer){promptSounds.mandarinSell = buffer;});

		initialized = true;
	}

//--//volume handling functions------------------------------------------------
	this.toggleMute = function() {
		if (!initialized) return;

		var newVolume = (masterBus.gain.value === 0 ? 1 : 0);
		masterBus.gain.setTargetAtTime(newVolume, audioCtx.currentTime, 0.03);
	}

	this.setMute = function(tOrF) {
		if (!initialized) return;

		var newVolume = (tOrF === false ? 1 : 0);
		masterBus.gain.setTargetAtTime(newVolume, audioCtx.currentTime, 0.03);
	}

	this.setMusicVolume = function(amount) {
		if (!initialized) return;

		musicVolume = amount;
		if (musicVolume > 1.0) {
			musicVolume = 1.0;
		} else if (musicVolume < 0.0) {
			musicVolume = 0.0;
		}
		musicBus.gain.setTargetAtTime(Math.pow(musicVolume, 2), audioCtx.currentTime, 0.03);
	}

	this.setSoundEffectsVolume = function(amount) {
		if (!initialized) return;

		soundEffectsVolume = amount;
		if (soundEffectsVolume > 1.0) {
			soundEffectsVolume = 1.0;
		} else if (soundEffectsVolume < 0.0) {
			soundEffectsVolume = 0.0;
		}
		soundEffectsBus.gain.setTargetAtTime(Math.pow(soundEffectsVolume, 2), audioCtx.currentTime, 0.03);
	}

	this.turnVolumeUp = function() {
		if (!initialized) return;

		this.setMusicVolume(musicVolume + VOLUME_INCREMENT);
		this.setSoundEffectsVolume(soundEffectsVolume + VOLUME_INCREMENT);
	}

	this.turnVolumeDown = function() {
		if (!initialized) return;

		this.setMusicVolume(musicVolume - VOLUME_INCREMENT);
		this.setSoundEffectsVolume(soundEffectsVolume - VOLUME_INCREMENT);
	}

//--//Audio playback classes---------------------------------------------------
	this.playSound = function(buffer, vol = randVol(), rate = randRate()) {
		if (!initialized) return;

		var source = audioCtx.createBufferSource();
		var gainNode = audioCtx.createGain();

		source.connect(gainNode);
		gainNode.connect(soundEffectsBus);

		source.buffer = buffer;

		source.playbackRate.value = rate;
		gainNode.gain.value = vol;
		source.start();

		return {sound: source, volume: gainNode};
	}

	this.playMusic = function(buffer) {
		if (!initialized) return;

		var source = audioCtx.createBufferSource();
		var gainNode = audioCtx.createGain();

		source.connect(gainNode);
		gainNode.connect(musicBus);

		source.buffer = buffer;

		source.loop = true;

		if (currentMusicTrack != null) {
			currentMusicTrack.volume.gain.setTargetAtTime(0, audioCtx.currentTime, CROSSFADE_TIME);
			currentMusicTrack.sound.stop(audioCtx.currentTime + CROSSFADE_TIME);
		}

		source.start();
		currentMusicTrack = {sound: source, volume: gainNode};

		return {sound: source, volume: gainNode};
	}

	this.loadSample = function loadSample(url, callback){
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		request.onload = function(){
			var audioData = request.response;
			audioCtx.decodeAudioData(audioData, function(buffer) {
				//console.log(buffer);
				callback(buffer);
			});
		};
		request.send();
	}
}

audio = new AudioGlobal();

genSounds = {};
promptSounds = {};
gameSounds = {};

//--//Helper functions---------------------------------------------------------

function randVol(range = 0.3, base = 1) {
	return Math.random() * range - range + base;
}

function randRate(range = 0.06, base = 1) {
	return Math.random() * range - range/2 + base;
}

function randItem(array) {
	return array[Math.floor(Math.random() * array.length)];
}

	