const VOLUME_INCREMENT = 0.05


var volume = {}
volume.music = {};
volume._musicValue = 0.7; //muted so I can listen to other music while playing and debugging, lol
Object.defineProperty(volume, 'music', {
	get() {	return volume._musicValue; },
	set(value) {
		volume._musicValue = value;
		if (volume._musicValue > 1) {volume._musicValue = 1;}
		if (volume._musicValue < 0) {volume._musicValue = 0;}
		musicManager.setVolume();
	}
});

var musicManager = new MusicManager();
function MusicManager() {
	var currentTrack = null;
	var fadeTrack = null;
	var nextTrack = null;
	var trackList = new Array();
	var currentTrackDuration = null;
	var nextTrackDuration = null;
	this.playing = false;
	this.onEndFunction = function() {return};

	this.update = function() {
		if (this.playing) {
			if (currentTrack.currentTime >= currentTrackDuration) {
				this.playNextTrack(false);
			}
		}

		if (fadeTrack != null && fadeTrack.volume >= 0.05) {
			fadeTrack.volume -= 0.05;

		}
		if (fadeTrack != null && fadeTrack.volume <= 0.1) {
			fadeTrack.pause();
			fadeTrack = null;
		}
	}

	this.play = function() {
		if(trackList == null) {
			return;
		}

		if (currentTrack == null) {
			currentTrack = new Audio(trackList[0].src);
			currentTrackDuration = trackList[0].dur;
			currentTrack.volume = Math.pow(volume.music, 2);
		}
		currentTrack.play();

		if (nextTrack == null) {
			if (trackList[1] != undefined) {
				nextTrack = new Audio(trackList[1].src);
				nextTrackDuration = trackList[1].dur;
			} else {
				if (!trackList || !trackList[0]) {
					console.log("Warning: music trackList is empty. Ignoring.");
					this.playing = false;
					nextTrack = null;
					return;
				}
				nextTrack = new Audio(trackList[0].src);
				nextTrackDuration = trackList[0].dur;
			}
			nextTrack.volume = Math.pow(volume.music, 2);
		}

		this.playing = true;
	}

	this.pause = function() {
		currentTrack.pause();

		if (fadeTrack != null) {
			fadeTrack.pause();
			fadeTrack = null;
		}

		this.playing = false;
	}

	this.stop = function() {
		currentTrack.pause();
		currentTrack.currentTime = 0;

		if (fadeTrack != null) {
			fadeTrack.pause();
			fadeTrack = null;
		}

		this.playing = false;
	}

	this.addTrack = function(musicTrackObject) {
		trackList.push(musicTrackObject);

		if (trackList.length <= 2) {
			if (trackList[1] != undefined) {
				nextTrack = new Audio(trackList[1].src);
				nextTrackDuration = trackList[1].dur;
			} else {
				nextTrack = new Audio(trackList[0].src);
				nextTrackDuration = trackList[0].dur;
			}
			nextTrack.volume = Math.pow(volume.music, 2);
		}
	}

	this.playNextTrack = function(fading = true) {
		this.onEndFunction();

		this.onEndFunction = function() {return};

		if (fadeTrack != null) {
			fadeTrack.pause();
		}
		if (fading) {
			fadeTrack = currentTrack;
		}
		currentTrack = nextTrack;
		currentTrackDuration = nextTrackDuration;
		nextTrack = null;
		if (trackList.length >= 2) {
			trackList.shift();
		}
		this.play();
	}

	this.moveToLastTrack = function() {
		while (trackList.length > 1) {
			trackList.shift();
		}
	}

	this.setVolume = function() {
		if (currentTrack) currentTrack.volume = Math.pow(volume.music, 2);
		if (nextTrack) nextTrack.volume = Math.pow(volume.music, 2);
	}

	this.startDuck = function() {
		if (currentTrack) currentTrack.volume = Math.pow(volume.music*0.7, 2);
		if (nextTrack) nextTrack.volume = Math.pow(volume.music*0.7, 2);
	}

	this.endDuck = function() {
		if (currentTrack) currentTrack.volume = Math.pow(volume.music, 2);
		if (nextTrack) nextTrack.volume = Math.pow(volume.music, 2);
	}
}

function MusicTrack(source, duration) {
	this.src = source;
	this.dur = duration;
}


volume.sfx = {};
volume._sfxValue = 0.7;
Object.defineProperty(volume, 'sfx', {
	get() {	return volume._sfxValue; },
	set(value) {
		volume._sfxValue = value;
		if (volume._sfxValue > 1) {volume._sfxValue = 1;}
		if (volume._sfxValue < 0) {volume._sfxValue = 0;}
	}
});

function sfxMulti(arrayOfSources, mixVolume = 1) {
	var sfxList = new Array();
	var vol = mixVolume;
	for (var i in arrayOfSources) {
		sfxList[i] = new Audio(arrayOfSources[i]);
	}

	this.play = function() {
		var currentSource = randItem(sfxList);
		currentSource.currentTime = 0;
		currentSource.volume = Math.pow(volume.sfx * vol, 2);
		currentSource.play();
	}
}

function sfxOverlap(source, mixVolume = 1) {
	var sfxList = new Array();
	var index = 0;
	sfxList[0] = new Audio(source);
	sfxList[1] = new Audio(source);
	var vol = mixVolume;

	this.play = function() {
		sfxList[index].currentTime = 0;
		sfxList[index].volume = Math.pow(volume.sfx * vol, 2);
		sfxList[index].play();

		index = index == 0 ? 1 : 0;
	}
}

function sfxOneShot(source, mixVolume = 1) {
	this.sfx = new Audio(source);
	var vol = mixVolume;

	this.play = function() {
		this.sfx.currentTime = 0;
		this.sfx.volume = Math.pow(volume.sfx * vol, 2);
		this.sfx.play();
	}
}

function sfxLooping(source, mixVolume = 1) {
	var sfx = new Audio(source);
	var vol = mixVolume;
	sfx.loop = true;

	this.play = function() {
		sfx.volume = Math.pow(volume.sfx * vol, 2);
		if (sfx.paused) {
			sfx.currentTime = 0;
			sfx.play();
		}
	}

	this.stop = function() {
		sfx.pause();
	}
}


volume.prompt = {};
volume._promptValue = 0.7;
Object.defineProperty(volume, 'prompt', {
	get() {	return volume._promptValue; },
	set(value) {
		volume._promptValue = value;
		if (volume._promptValue > 1) {volume._promptValue = 1;}
		if (volume._promptValue < 0) {volume._promptValue = 0;}
	}
});

function promptSound(source) {
	promptAudio.loading++;
	this.sfx = new Audio(source);
	this.sfx.oncanplaythrough = function() {promptAudio.loading--; }
	this.type = 'AUDIO';

	this.play = function() {
		this.sfx.currentTime = 0;
		this.sfx.volume = Math.pow(volume.prompt, 2);
		this.sfx.play();

		musicManager.startDuck();
		this.sfx.onended = function()
		{
			musicManager.endDuck();
		}	}
}

promptAudio = {};
promptAudio.loading = 0;

/*
promptAudio.woman = new promptSound('audio/PromptsAndAnswers/woman.mp3');
promptAudio.women = new promptSound('audio/PromptsAndAnswers/women.mp3');
promptAudio.man = new promptSound('audio/PromptsAndAnswers/man.mp3');
promptAudio.men = new promptSound('audio/PromptsAndAnswers/men.mp3');
promptAudio.he = new promptSound('audio/PromptsAndAnswers/he.mp3');
promptAudio.she = new promptSound('audio/PromptsAndAnswers/she.mp3');

//cVc Section
//English cVcs
promptAudio.blendedCat = new promptSound('audio/PromptsAndAnswers/blendedCat.mp3');
promptAudio.blendedCot = new promptSound('audio/PromptsAndAnswers/blendedCot.mp3');

//mandarin cVcs
promptAudio.mandarinHowAreYou = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinHowAreYou.mp3');
promptAudio.mandarinHowAmI = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinHowAmI.mp3');
promptAudio.mandarinHowAreThey = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinHowAreThey.mp3');
promptAudio.mandarinHowAreWe = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinHowAreWe.mp3');
promptAudio.mandarinHowIsHe = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinHowIsHe.mp3');
promptAudio.mandarinHowIsShe = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinHowIsHe.mp3');
promptAudio.mandarinHowIsItDoing = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinHowIsItDoing.mp3');
promptAudio.mandarinImVeryGood = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinImVeryGood.mp3');
promptAudio.mandarinNotBad = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinNotBad.mp3');
promptAudio.mandarinImAlsoVeryGood = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinImAlsoVeryGood.mp3');
promptAudio.mandarinVeryNiceToMeetYou = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinVeryNiceToMeetYou.mp3');
promptAudio.mandarinWhereAreYouFrom = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinWhereAreYouFrom.mp3');
promptAudio.mandarinImFromAmerica = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinImFromAmerica.mp3');
promptAudio.mandarinWhatDoYouLikeToDo = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinWhatDoYouLikeToDo.mp3');
promptAudio.mandarinWhatPartOfChina = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinWhatPartOfChina.mp3');
promptAudio.mandarinWhereDoYouLive = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinWhereDoYouLive.mp3');
promptAudio.mandarinILiveInVietnam = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinILiveInVietnam.mp3');
promptAudio.mandarinMeToo = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinMeToo.mp3');
promptAudio.mandarinILikeProgramming = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinILikeProgramming.mp3');
promptAudio.mandarinIAlsoLikeFitness = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinIAlsoLikeFitness.mp3');
promptAudio.mandarinWhatIsYourJob = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinWhatIsYourJob.mp3');
promptAudio.mandarinIAmATeacher = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinIAmATeacher.mp3');
promptAudio.mandarinAnythingElse = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinAnythingElse.mp3');
promptAudio.mandarinILikeWatchingMovies = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinILikeWatchingMovies.mp3');
promptAudio.mandarinILikeRockClimbing = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinILikeRockClimbing.mp3');
promptAudio.mandarinWhatIsYourName = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinWhatIsYourName.mp3');
promptAudio.mandarinMyNameIsSteven = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinMyNameIsSteven.mp3');
promptAudio.mandarinHowOldAreYou = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinHowOldAreYou.mp3');
promptAudio.mandarinIAm37YearsOld = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinIAm37YearsOld.mp3');

//polite mandarin phrases group 1
promptAudio.mandarinPlease = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinPlease.mp3');
promptAudio.mandarinSorry = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinSorry.mp3');
promptAudio.mandarinExcuseMeQuestionAskingContext = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinExcuseMeQuestionContext.mp3');
promptAudio.mandarinWaitAMoment = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinWaitAMoment.mp3');
promptAudio.mandarinThankYou = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinThankYou.mp3');
promptAudio.mandarinAnyTime = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinAnyTime.mp3');
promptAudio.mandarinYoureWelcome = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinYoureWelcome.mp3');
promptAudio.mandarinExcuseMePassingThroughContext = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinExcuseMePassingThroughContext.mp3');
promptAudio.mandarinIAppreciateThat = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinIAppreciateThat.mp3');
promptAudio.mandarinYouHaveWorkedHard = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinYouWorkedHard.mp3');

//polite mandarin phrases group 2
promptAudio.mandarinLongTimeNoSee = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinLongTimeNoSee.mp3');
promptAudio.mandarinIllLetYouGo = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinIllLetYouGo.mp3');
promptAudio.mandarinPleaseAdviseMe = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinPleaseAdvise.mp3');
promptAudio.mandarinIRespectfullyWait = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinIRespectfullyWait.mp3');
promptAudio.mandarinMyHumbleOpinion = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinInMyHumbleOpinion.mp3');
promptAudio.mandarinExcuseMeForSayingThis = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinExcuseMeForSayingThis.mp3');
promptAudio.mandarinItsOK = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinItsOK.mp3');
promptAudio.mandarinItsMyDuty = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinItsMyDuty.mp3');
promptAudio.mandarinSorryForMyLowSkill = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinSorryForMyLowSkill.mp3');

//common words
promptAudio.mandarinToBe = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinToBe.mp3');
promptAudio.mandarinOf = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinOf.mp3');
promptAudio.mandarinNot = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinNot.mp3');
promptAudio.mandarinLe = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinLe.mp3');
promptAudio.mandarinPerson = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinPerson.mp3');
promptAudio.mandarinI = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinI.mp3');
promptAudio.mandarinYou = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinYou.mp3');
promptAudio.mandarinAt = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinAt.mp3');
promptAudio.mandarinHave = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinHave.mp3');
promptAudio.mandarinIn = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinIn.mp3');

promptAudio.mandarinBuy = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinBuy.mp3');
promptAudio.mandarinSell = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinSell.mp3');

promptAudio.mandarinMom = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinMom.mp3');
promptAudio.mandarinHorse = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinHorse.mp3');

promptAudio.mandarinThisOne = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinThisOne.mp3');
promptAudio.mandarinThatOne = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinThatOne.mp3');
promptAudio.mandarinTheseOnes = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinTheseOnes.mp3');
promptAudio.mandarinThoseOnes = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinThoseOnes.mp3');

promptAudio.mandarinHe = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinHe.mp3');
promptAudio.mandarinCouch = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinCouch.mp3')
promptAudio.mandarinTower = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinTower.mp3');

promptAudio.mandarinThisArea = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinThisArea.mp3');
promptAudio.mandarinThatArea = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinThatArea.mp3');

promptAudio.mandarinSleep = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinSleep.mp3');
promptAudio.mandarinDumplings = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinDumplings.mp3');

promptAudio.mandarinToday = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinToday.mp3');
promptAudio.mandarinTomorrow = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinTomorrow.mp3');
promptAudio.mandarinYesterday = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinYesterday.mp3');

promptAudio.mandarinBlack = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinBlack.mp3');//黑色
promptAudio.mandarinWhite = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinWhite.mp3');//白色
promptAudio.mandarinGray = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinGray.mp3');//灰色
promptAudio.mandarinRed = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinRed.mp3');//红色
promptAudio.mandarinBrown = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinBrown.mp3');//棕色
promptAudio.mandarinYellow = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinYellow.mp3');//黄色
promptAudio.mandarinGreen = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinGreen.mp3');//绿色
promptAudio.mandarinBlue = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinBlue.mp3');//蓝色
promptAudio.mandarinPurple = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinPurple.mp3');//紫色
promptAudio.mandarinPink = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinPink.mp3');//粉

promptAudio.mandarin0 = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarin0.mp3');
promptAudio.mandarin1 = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarin1.mp3');
promptAudio.mandarin2 = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarin2.mp3');
promptAudio.mandarin3 = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarin3.mp3');
promptAudio.mandarin4 = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarin4.mp3');
promptAudio.mandarin5 = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarin5.mp3');
promptAudio.mandarin6 = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarin6.mp3');
promptAudio.mandarin7 = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarin7.mp3');
promptAudio.mandarin8 = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarin8.mp3');
promptAudio.mandarin9 = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarin9.mp3');

promptAudio.mandarinHello = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinHello.mp3');
promptAudio.mandarinImGoodAndYou = new promptSound('audio/PromptsAndAnswers/Mandarin/mandarinImGoodAndYou.mp3');

//central vietnamese
promptAudio.centralVietnameseHelloMan = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseHelloMan.mp3');
promptAudio.centralVietnameseHelloWoman = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseHelloWoman.mp3');
promptAudio.centralVietnameseWhatsYourNameGeneral = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseWhatsYourNameGeneral.mp3');
promptAudio.centralVietnameseWhatsYourNameBrother = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseWhatsYourNameBrother.mp3');
promptAudio.centralVietnameseWhatsYourNameBaby = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseWhatsYourNameBaby.mp3');
promptAudio.centralVietnameseMyNameIsSteven = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseMyNameIsSteven.mp3');
promptAudio.centralVietnameseWhereAreYouFrom = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseWhereAreYouFrom.mp3');
promptAudio.centralVietnameseIAmFromAmerica = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseIAmFromAmerica.mp3');
promptAudio.centralVietnameseWhatDoYouLikeToEat = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseWhatDoYouLikeToEat.mp3');
promptAudio.centralVietnameseILikeToEatVegetarian = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseILikeToEatVegetarian.mp3');
promptAudio.centralVietnameseGoodBye = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseGoodbye.mp3');
promptAudio.centralVietnameseVeryNiceToMeetYou = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseVeryNiceToMeetYou.mp3');
promptAudio.centralVietnameseHowAreYouGeneral = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseHowAreYouGeneral.mp3');
promptAudio.centralVietnameseGoodAndYouGeneral = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseGoodAndYouGeneral.mp3');
promptAudio.centralVietnameseExcuseMe = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnameseExcuseMe.mp3');
promptAudio.centralVietnamesePoliteHello = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/centralVietnamesePoliteHello.mp3');

promptAudio.centralVietnameseStraightToneA = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStraightToneA.mp3');
promptAudio.centralVietnameseFallingToneA = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseFallingToneA.mp3');
promptAudio.centralVietnameseRisingToneA = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseRisingToneA.mp3');
promptAudio.centralVietnameseRisingStutterToneA = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseRisingStutterToneA.mp3');
promptAudio.centralVietnameseLowStaccatoToneA = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseLowStaccatoToneA.mp3');
promptAudio.centralVietnameseRisingHatAU = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseRisingHatAU.mp3');
promptAudio.centralVietnameseStraightI = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseI.mp3');
promptAudio.centralVietnameseHatE = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseHatE.mp3');
promptAudio.centralVietnameseE = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseE.mp3');
promptAudio.centralVietnameseFallingI = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseFallingI.mp3');
promptAudio.centralVietnameseU = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseU.mp3');
promptAudio.centralVietnameseHatO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseHatO.mp3');
promptAudio.centralVietnameseO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseO.mp3');
promptAudio.centralVietnameseQuestionU = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseQuestionU.mp3');
promptAudio.centralVietnameseQuestionO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseQuestionO.mp3');
promptAudio.centralVietnameseFallingE = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseFallingE.mp3');
promptAudio.centralVietnameseFallingO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseFallingO.mp3');
promptAudio.centralVietnameseFallingU = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseFallingU.mp3');
promptAudio.centralVietnameseStutterE = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStutterE.mp3');
promptAudio.centralVietnameseStutterI = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStutterI.mp3');
promptAudio.centralVietnameseStutterO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStutterO.mp3');
promptAudio.centralVietnameseStutterU = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStutterU.mp3');
promptAudio.centralVietnameseYoYoA = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseYoYoA.mp3');
promptAudio.centralVietnameseYoYoE = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseYoYoE.mp3');
promptAudio.centralVietnameseYoYoI = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseYoYoI.mp3');
promptAudio.centralVietnameseYoYoO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseYoYoO.mp3');
promptAudio.centralVietnameseYoYoU = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseYoYoU.mp3');
promptAudio.centralVietnameseRisingE = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseRisingE.mp3');
promptAudio.centralVietnameseRisingO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseRisingO.mp3');
promptAudio.centralVietnameseRisingI = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseRisingI.mp3');
promptAudio.centralVietnameseRisingU = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseRisingU.mp3');
promptAudio.centralVietnameseStaccatoE = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStaccatoE.mp3');
promptAudio.centralVietnameseStaccatoO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStaccatoO.mp3');
promptAudio.centralVietnameseStaccatoI = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStaccatoI.mp3');
promptAudio.centralVietnameseStaccatoU = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStaccatoU.mp3');
promptAudio.centralVietnameseHookO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseHookO.mp3');
promptAudio.centralVietnameseHalfPipeA = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseHalfPipeA.mp3');
promptAudio.centralVietnameseRisingHatA = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseRisingHatA.mp3');
promptAudio.centralVietnameseFallingHatA = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseFallingHatA.mp3');
promptAudio.centralVietnameseYoYoHatA = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseYoYoHatA.mp3');
promptAudio.centralVietnameseStutterHatA = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStutterHatA.mp3');
promptAudio.centralVietnameseStaccatoHatA = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStaccatoHatA.mp3');
promptAudio.centralVietnameseFallingHatE = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseFallingHatE.mp3');
promptAudio.centralVietnameseYoYoHatE = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseYoYoHatE.mp3');
promptAudio.centralVietnameseStutterHatE = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStutterHatE.mp3');
promptAudio.centralVietnameseStaccatoHatE = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStaccatoHatE.mp3');
promptAudio.centralVietnameseRisingHatO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseRisingHatO.mp3');
promptAudio.centralVietnameseFallingHatO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseFallingHatO.mp3');
promptAudio.centralVietnameseYoYoHatO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseYoYoHatO.mp3');
promptAudio.centralVietnameseStutterHatO = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseStutterHatO.mp3');

//consonants
promptAudio.centralVietnameseB = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseB.mp3');
promptAudio.centralVietnameseC = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseC.mp3');
promptAudio.centralVietnameseD = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseD.mp3');
promptAudio.centralVietnameseTh = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseTh.mp3');
promptAudio.centralVietnameseNg = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseNg.mp3');
promptAudio.centralVietnameseLinedD = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseLinedD.mp3');
promptAudio.centralVietnameseG = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseG.mp3');
promptAudio.centralVietnameseH = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseH.mp3');
promptAudio.centralVietnameseK = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseK.mp3');
promptAudio.centralVietnameseL = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseL.mp3');
promptAudio.centralVietnameseM = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseM.mp3');
promptAudio.centralVietnameseN = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseN.mp3');
promptAudio.centralVietnameseP = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseP.mp3');
promptAudio.centralVietnameseQ = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseQ.mp3');
promptAudio.centralVietnameseR = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseR.mp3');
promptAudio.centralVietnameseS = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseS.mp3');
promptAudio.centralVietnameseT = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseT.mp3');
promptAudio.centralVietnameseV = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseV.mp3');
promptAudio.centralVietnameseX = new promptSound('audio/PromptsAndAnswers/CentralVietnamese/phonics/centralVietnameseX.mp3');

promptAudio.pinyinA = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinA.mp3');
promptAudio.pinyinO = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinO.mp3');
promptAudio.pinyinE = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinE.mp3');
promptAudio.pinyinI = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinI.mp3');
promptAudio.pinyinU = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinU.mp3');
promptAudio.pinyinEr = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinEr.mp3');
promptAudio.pinyinB = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinB.mp3');
promptAudio.pinyinP = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinP.mp3');
promptAudio.pinyinN = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinN.mp3');
promptAudio.pinyinM = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinM.mp3');
promptAudio.pinyinF = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinF.mp3');
promptAudio.pinyinD = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinD.mp3');
promptAudio.pinyinT = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinT.mp3');
promptAudio.pinyinL = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinL.mp3');
promptAudio.pinyinC = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinC.mp3');
promptAudio.pinyinS = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinS.mp3');
promptAudio.pinyinH = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinH.mp3');
promptAudio.pinyinK = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinK.mp3');
promptAudio.pinyinG = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinG.mp3');
promptAudio.pinyinG = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinG.mp3');
promptAudio.pinyinSi = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinSi.mp3');
promptAudio.pinyinZi = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinZi.mp3');
promptAudio.pinyinSh = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinSh.mp3');
promptAudio.pinyinCh = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinCh.mp3');
promptAudio.pinyinZh = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinZh.mp3');
promptAudio.pinyinR = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinR.mp3');
promptAudio.pinyinShi = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinShi.mp3');
promptAudio.pinyinChi = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinChi.mp3');
promptAudio.pinyinZhi = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinZhi.mp3');
promptAudio.pinyinRi = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinRi.mp3');
promptAudio.pinyinX = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinX.mp3');
promptAudio.pinyinQ = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinQ.mp3');
promptAudio.pinyinJ = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinJ.mp3');
promptAudio.pinyinAo = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinAo.mp3');
promptAudio.pinyinAi = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinAi.mp3');
promptAudio.pinyinEi = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinEi.mp3');
promptAudio.pinyinUo = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinUo.mp3');
promptAudio.pinyinUa = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinUa.mp3');
promptAudio.pinyinIa = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinIa.mp3');
promptAudio.pinyinIe = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinIe.mp3');
promptAudio.pinyinUe = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinUe.mp3');
promptAudio.pinyinIao = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinIao.mp3');
promptAudio.pinyinIou = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinIou.mp3');
promptAudio.pinyinUai = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinUai.mp3');
promptAudio.pinyinUei = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinUei.mp3');

promptAudio.pinyinWa = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinWa.mp3');
promptAudio.pinyinYa = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinYa.mp3');
promptAudio.pinyinWo = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinWo.mp3');
promptAudio.pinyinYe = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinYe.mp3');
promptAudio.pinyinYi = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinYi.mp3');
promptAudio.pinyinWu = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinWu.mp3');
promptAudio.pinyinYu = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinYu.mp3');
promptAudio.pinyinYue = new promptSound('audio/PromptsAndAnswers/Mandarin/Phonics/pinyinYue.mp3');

promptAudio.englishBee = new promptSound('audio/PromptsAndAnswers/bee.mp3');
promptAudio.englishFlower = new promptSound('audio/PromptsAndAnswers/flower.mp3');

// A-Z in English
promptAudio.a = new promptSound('audio/letters/a.mp3');
promptAudio.b = new promptSound('audio/letters/b.mp3');
promptAudio.c = new promptSound('audio/letters/c.mp3');
promptAudio.d = new promptSound('audio/letters/d.mp3');
promptAudio.e = new promptSound('audio/letters/e.mp3');
promptAudio.f = new promptSound('audio/letters/f.mp3');
promptAudio.g = new promptSound('audio/letters/g.mp3');
promptAudio.h = new promptSound('audio/letters/h.mp3');
promptAudio.i = new promptSound('audio/letters/i.mp3');
promptAudio.j = new promptSound('audio/letters/j.mp3');
promptAudio.k = new promptSound('audio/letters/k.mp3');
promptAudio.l = new promptSound('audio/letters/l.mp3');
promptAudio.m = new promptSound('audio/letters/m.mp3');
promptAudio.n = new promptSound('audio/letters/n.mp3');
promptAudio.o = new promptSound('audio/letters/o.mp3');
promptAudio.p = new promptSound('audio/letters/p.mp3');
promptAudio.q = new promptSound('audio/letters/q.mp3');
promptAudio.r = new promptSound('audio/letters/r.mp3');
promptAudio.s = new promptSound('audio/letters/s.mp3');
promptAudio.t = new promptSound('audio/letters/t.mp3');
promptAudio.u = new promptSound('audio/letters/u.mp3');
promptAudio.v = new promptSound('audio/letters/v.mp3');
promptAudio.w = new promptSound('audio/letters/w.mp3');
promptAudio.x = new promptSound('audio/letters/x.mp3');
promptAudio.y = new promptSound('audio/letters/y.mp3');
promptAudio.z = new promptSound('audio/letters/z.mp3');
*/


gameAudio = {};

var genAudio = {};
/*
genAudio.transitionMusic1 = new MusicTrack("audio/backgroundTracks/levelTransitionSound.mp3", 5);
genAudio.transitionMusic2 = new MusicTrack("audio/backgroundTracks/Transition2.mp3", 5.5);
genAudio.transitionMusic3 = new MusicTrack("audio/backgroundTracks/Transition3.mp3", 4);
genAudio.playTransitionMusic = function() {
	musicManager.addTrack(randItem([genAudio.transitionMusic1,genAudio.transitionMusic2,genAudio.transitionMusic3]));
	musicManager.moveToLastTrack();
	musicManager.playNextTrack();
	musicManager.addTrack(gameClassManager.currentGame.backgroundMusic);
	if (SKIP_TRANSITIONS) {
		console.log("Skipping transition music");
		fullGameStateMachine.loadCurrentState(fullGameStateMachine.FULL_GAME_ENUMERABLE_STATES.playingMiniGame);
		promptersManager.promptThePlayer();
		if (gameClassManager.currentGame.startGameSpecialCode) {
			gameClassManager.currentGame.startGameSpecialCode();
		}
		gameCanvasContext.globalAlpha = 1;
		return;
	}
	musicManager.onEndFunction = function() {
		fullGameStateMachine.loadCurrentState(fullGameStateMachine.FULL_GAME_ENUMERABLE_STATES.playingMiniGame);
		promptersManager.promptThePlayer();
		if (gameClassManager.currentGame.startGameSpecialCode) {
			gameClassManager.currentGame.startGameSpecialCode();
		}
		gameCanvasContext.globalAlpha = 1;
	}
}
genAudio.titleMusic = new MusicTrack('audio/backgroundTracks/titleScreenMusic.mp3', 6.21);
genAudio.playTitleMusic = function() {
	musicManager.addTrack(genAudio.titleMusic);
	musicManager.moveToLastTrack();
	musicManager.playNextTrack();
}

genAudio.click = new sfxMulti(["audio/UI_01.mp3", "audio/UI_02.mp3", "audio/UI_03.mp3", "audio/UI_04.mp3"]);
genAudio.playClick = function() {
	genAudio.click.play();
}
genAudio.positive = new sfxMulti(["audio/Positive_01.mp3", "audio/Positive_02.mp3", "audio/Positive_03.mp3", "audio/Positive_04.mp3"]);
genAudio.playPositive = function() {
	genAudio.positive.play();
}
genAudio.negative = new sfxMulti(["audio/Negative_01.mp3", "audio/Negative_02.mp3", "audio/Negative_03.mp3", "audio/Negative_04.mp3"]);
genAudio.playNegative = function() {
	genAudio.negative.play();
}
*/

function randItem(array) {
	return array[Math.floor(Math.random() * array.length)];
}