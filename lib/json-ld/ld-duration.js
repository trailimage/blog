'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Duration
 * @see http://schema.org/Duration
 * @see https://en.wikipedia.org/wiki/ISO_8601
 */

class DurationSchema extends BaseSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.duration; }
		super(type);
	}
}


module.exports = DurationSchema;