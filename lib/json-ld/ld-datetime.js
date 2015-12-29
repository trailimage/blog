'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.DateTime
 * @see http://schema.org/DateTime
 * @see https://en.wikipedia.org/wiki/ISO_8601
 */

class DateTimeSchema extends BaseSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.dateTime; }

		super(type);
	}
}


module.exports = DateTimeSchema;