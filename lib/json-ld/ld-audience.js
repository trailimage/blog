'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Audience
 * @see http://schema.org/Audience
 */
class AudienceSchema extends ThingSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.audience; }

		super(type);

		/** @type String */
		this.audienceType = null;
		/** @type TI.LinkData.AdminArea */
		this.geographicArea = null;
	}
}

module.exports = AudienceSchema;