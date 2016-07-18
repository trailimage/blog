'use strict';

const { creativeWork, Music } = require('../');

// http://schema.org/MusicPlaylist
module.exports = creativeWork.extend(Music.Type.playlist, {
	numTracks: 0,
	track: null
});