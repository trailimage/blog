'use strict';

const { creativeWork, Music } = require('../');

// http://schema.org/MusicRecording
module.exports = creativeWork.extend(Music.Type.recording, {
	byArtist: null,
	duration: null,
	inAlbum: null,
	inPlaylist: null,
	recordingOf: null
});