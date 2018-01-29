setFormat();
var isMuted = false
var musicVolume = 1;
var sfxVolume = 1;

//set sound clips and music tracks here
var track1 = new musicTrack("../Audio/Layer1");
var track2 = new musicTrack("../Audio/Layer2");
var backgroundMusic = new musicLoopSingle(track1);








function setFormat() {
  var audio = new Audio();
  if (audio.canPlayType("audio/ogg")) {
      audioFormat = ".ogg";
  } else {
      audioFormat = ".mp3";
  }
}