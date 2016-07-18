'use strict';

const { creativeWork, Music } = require('../');

// http://schema.org/MusicComposition
module.exports = creativeWork.extend(Music.Type.composition, {
	composer: null,
	firstPerformance: null,
	lyricist: null,
	lyrics: null,
	musicArrangement: null,
	musicalKey: null,
	recordedAs: null
});