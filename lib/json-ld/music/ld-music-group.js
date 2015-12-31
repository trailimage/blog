'use strict';

const TI = require('../');
const OrganizationSchema = TI.LinkData.Organization;

/**
 * @extends TI.LinkData.Organization
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Music.Group
 * @see http://schema.org/MusicGroup
 */

class MusicGroupSchema extends OrganizationSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Music.Type.group; }

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
	}
}


module.exports = MusicGroupSchema;