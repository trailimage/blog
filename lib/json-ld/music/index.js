'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace TI.LinkData.Music
 */
class LinkDataMusicNamespace {
	static get Album() { return require('./ld-music-album.js'); }
	static get Composition() { return require('./ld-music-composition.js'); }
	static get Group() { return require('./ld-music-group.js'); }
	static get Playlist() { return require('./ld-music-playlist.js'); }
	static get Recording() { return require('./ld-music-recording.js'); }
	static get Release() { return require('./ld-music-release.js'); }
}

/**
 * @alias TI.LinkData.Music.Type
 */
LinkDataMusicNamespace.Type = {
	album: 'MusicAlbum',
	composition: 'MusicComposition',
	group: 'MusicGroup',
	playlist: 'MusicPlaylist',
	recording: 'MusicRecording',
	release: 'MusicRelease'
};

module.exports = LinkDataMusicNamespace;

