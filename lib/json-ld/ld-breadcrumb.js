'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Breadcrumb
 * @see http://schema.org/Breadcrumb
 */
class BlogSchema extends ThingSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.breadcrumb; }
		super(type);

	}
}

module.exports = BlogSchema;