'use strict';

const { creativeWork, Music } = require('../');

// http://schema.org/MusicAlbum
module.exports = creativeWork.extend(Music.Type.album, {
	composer: null,
	firstPerformance: null,
	lyricist: null,
	lyrics: null,
	musicArrangement: null,
	musicalKey: null,
	recordedAs: null
});