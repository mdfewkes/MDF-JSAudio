setFormat();
setAudioPath("Audio/");

//set sound clips and music tracks here
var track1 = new musicTrackOverlap("lay4tail16", 16);
var track2 = new musicTrackOverlap("lay2tail8", 8);
var track3 = new musicTrackOverlap("LayTail34", 8);
var backgroundTracks = new musicContainerCrossfadeLoop([track1, track2, track3]);
var layer1 = new musicTrackOverlap("clavtail2", 2);
var layer2 = new musicTrackOverlap("cabasatail2", 2);
var layer3 = new musicTrackOverlap("kicktail2", 2);
var backgroundLayers = new musicContainerLayersLoop([layer1, layer2, layer3]);
var backgroundMusic = new musicContainerCrossfade([backgroundTracks, backgroundLayers]);

var controles = new sfxClipSpriteSheet("controls", [[0.242,0.578],[1.326,1.82],[2.6,2.95]]);
var conPlay = new sfxClipSprite(controles, 0);
var conPause = new sfxClipSprite(controles, 1);
var conStop = new sfxClipSprite(controles, 2);

track1.setTrackName("track1");
track2.setTrackName("track2");
track3.setTrackName("track3");
track2.setMixVolume(0.85);
track3.setMixVolume(0.75);

layer1.setTrackName("layer1");
layer2.setTrackName("layer2");
layer3.setTrackName("layer3");
backgroundLayers.setLayerLevel(1,0);
backgroundLayers.setLayerLevel(2,0);


controles.setMixVolume(0.75);



var test1 = new musicTrack("lay4tail16", 16);
var test2 = new musicTrackOverlap("cabasatail2", 2);
var test3 = new musicTrackOverlap("kicktail2", 2);

var testC = new musicContainerPlaylistLoopLast([test1,test2]);