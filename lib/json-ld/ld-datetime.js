'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.DateTime
 * @see http://schema.org/DateTime
 * @see https://en.wikipedia.org/wiki/ISO_8601
 */

class DateTimeSchema extends ThingSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.dateTime; }

		super(type);
	}
}


module.exports = DateTimeSchema;