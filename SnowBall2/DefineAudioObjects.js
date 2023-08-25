setAudioPath("Audio/");

//set sound clips and music tracks here
var track1 = new clipOverlapWTail("lay4tail16.ogg", 16);
var track2 = new clipOverlapWTail("lay2tail8.ogg", 8);
var track3 = new clipOverlapWTail("LayTail34.ogg", 8);
var backgroundFade = new containerCrossfadeLoop([track1, track2, track3]);
var layer1 = new clipOverlapWTail("clavtail2.ogg", 2);
var layer2 = new clipOverlapWTail("cabasatail2.ogg", 2);
var layer3 = new clipOverlapWTail("kicktail2.ogg", 2);
var backgroundLayers = new containerLayerLoop([layer1, layer2, layer3]);
var backgroundMusic = new containerCrossfade([backgroundFade, backgroundLayers]);

var controles = new soundSpriteSheet("controls.ogg", [[0.242,0.578],[1.326,1.82],[2.6,3.1]]);
var conPlay = new soundSprite(controles, 0);
var conPause = new soundSprite(controles, 1);
var conStop = new soundSprite(controles, 2);

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

var testS = new silence(3);
var testC = new container([testS]);