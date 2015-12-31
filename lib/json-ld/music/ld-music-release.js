'use strict';

const TI = require('../');
const MusicPlayListSchema = TI.LinkData.Music.Playlist;

/**
 * @extends TI.LinkData.Music.Playlist
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Music.Release
 * @see http://schema.org/MusicRelease
 */

class MusicReleaseSchema extends MusicPlayListSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Music.Type.release; }

		super(type);

		/** @type String */
		this.catalogNumber = null;
		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.creditedTo = null;
		/** @type TI.LinkData.Duration */
		this.duration = null;
		/** @type TI.LinkData.Organization */
		this.recordLabel = null;
		/** @type TI.LinkData.Music.Album */
		this.releaseOf = null;
	}
}

module.exports = MusicReleaseSchema;