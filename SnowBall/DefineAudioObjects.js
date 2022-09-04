setFormat();
setAudioPath("Audio/");

//set sound clips and music tracks here
var track1 = new musicClipOverlap("lay4tail16", 16);
var track2 = new musicClipOverlap("lay2tail8", 8);
var track3 = new musicClipOverlap("LayTail34", 8);
var backgroundFade = new containerCrossfadeLoop([track1, track2, track3]);
var layer1 = new musicClipOverlap("clavtail2", 2);
var layer2 = new musicClipOverlap("cabasatail2", 2);
var layer3 = new musicClipOverlap("kicktail2", 2);
var backgroundLayers = new containerLayersLoop([layer1, layer2, layer3]);
var backgroundMusic = new containerCrossfade([backgroundFade, backgroundLayers]);

var controles = new sfxClipSpriteSheet("controls", [[0.242,0.578],[1.326,1.82],[2.6,3.1]]);
var conPlay = new sfxClipSprite(controles, 0);
var conPause = new sfxClipSprite(controles, 1);
var conStop = new sfxClipSprite(controles, 2);

track1.name = "track1";
track2.name = "track2";
track3.name = "track3";
track2.setMixVolume(0.85);
track3.setMixVolume(0.75);

layer1.name = "layer1";
layer2.name = "layer2";
layer3.name = "layer3";
backgroundLayers.setLayerLevel(1,0);
backgroundLayers.setLayerLevel(2,0);


controles.setMixVolume(0.75);



var test1 = new musicClip("lay4tail16", 16);
var testC = new container([test1]);