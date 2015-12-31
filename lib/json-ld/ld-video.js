'use strict';

const TI = require('../');
const MediaSchema = TI.LinkData.Media;

/**
 * @extends TI.LinkData.Media
 * @extends TI.LinkData.CreativeWork
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Video
 * @see http://schema.org/VideoObject
 */

class VideoSchema extends MediaSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.video; }

		super(type);

		/** @type TI.LinkData.Person */
		this.actor = null;
		/** @type TI.LinkData.Person */
		this.director = null;
		/** @type String */
		this.caption = null;
		/** @type TI.LinkData.Image */
		this.thumbnail = null;
		/** @type String */
		this.videoFrameSize = null;
		/** @type String */
		this.videoQuality = null;
		/** @type TI.LinkData.Person|TI.LinkData.Music.Group */
		this.musicBy = null;
	}
}


module.exports = VideoSchema;