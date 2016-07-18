'use strict';

const load = require('../../module-loader')('./json-ld/music/ld-music*.js');

// use getters to delay module initialization and avoid circular dependencies
module.exports = {
	get album() { return load('album'); },
	get composition() { return load('composition'); },
	get group() { return load('group'); },
	get playlist() { return load('playlist'); },
	get recording() { return load('recording'); },
	get release() { return load('release'); },

	Type: {
		album: 'MusicAlbum',
		composition: 'MusicComposition',
		group: 'MusicGroup',
		playlist: 'MusicPlaylist',
		recording: 'MusicRecording',
		release: 'MusicRelease'
	}
};