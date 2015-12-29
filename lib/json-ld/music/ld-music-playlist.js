'use strict';

const TI = require('../');
const CreativeWorkSchema = TI.LinkData.CreativeWork;

/**
 * @extends TI.LinkData.CreativeWork
 * @alias TI.LinkData.Music.Playlist
 * @see http://schema.org/MusicPlaylist
 */

class MusicPlaylistSchema extends CreativeWorkSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Music.Type.playlist; }

		super(type);

		/** @type Number */
		this.numTracks = 0;
		/** @type TI.LinkData.Music.Recording|TI.LinkData.List */
		this.track = null;
	}
}


module.exports = MusicPlaylistSchema;