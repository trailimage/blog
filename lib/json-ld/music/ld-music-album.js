'use strict';

const TI = require('../');
const CreativeWorkSchema = TI.LinkData.CreativeWork;

/**
 * @extends TI.LinkData.CreativeWork
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Music.Album
 * @see http://schema.org/MusicAlbum
 */

class MusicAlbumSchema extends CreativeWorkSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Music.Type.composition; }

		super(type);

		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.composer = null;
		/** @type TI.LinkData.Event */
		this.firstPerformance = null;
		/** @type TI.LinkData.Person */
		this.lyricist = null;
		/** @type TI.LinkData.CreativeWork */
		this.lyrics = null;
		/** @type TI.LinkData.Music.Composition */
		this.musicArrangement = null;
		/** @type String */
		this.musicalKey = null;
		/** @type TI.LinkData.Music.Recording */
		this.recordedAs = null;
	}
}


module.exports = MusicAlbumSchema;