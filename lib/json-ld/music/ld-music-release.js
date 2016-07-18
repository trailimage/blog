'use strict';

const { Music } = require('../');

//  http://schema.org/MusicRelease
module.exports = Music.playlist.extend(Music.Type.release, {
	catalogNumber: null,
	creditedTo: null,
	duration: null,
	recordLabel: null,
	releaseOf: null
});