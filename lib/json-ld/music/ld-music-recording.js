'use strict';

const TI = require('../');
const CreativeWorkSchema = TI.LinkData.CreativeWork;

/**
 * @extends TI.LinkData.CreativeWork
 * @alias TI.LinkData.Music.Recording
 * @see http://schema.org/MusicRecording
 */

class MusicRecordingSchema extends CreativeWorkSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.recording; }

		super(type);

		/** @type TI.LinkData.Music.Group */
		this.byArtist = null;
		/** @type TI.LinkData.Duration */
		this.duration = null;
		/** @type TI.LinkData.Music.Album */
		this.inAlbum = null;
		/** @type TI.LinkData.Music.Playlist */
		this.inPlaylist = null;
		/** @type TI.LinkData.Music.Composition */
		this.recordingOf = null;
	}
}


module.exports = MusicRecordingSchema;