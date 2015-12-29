'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Duration
 * @see http://schema.org/Duration
 * @see https://en.wikipedia.org/wiki/ISO_8601
 */

class DurationSchema extends ThingSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.duration; }
		super(type);
	}
}


module.exports = DurationSchema;