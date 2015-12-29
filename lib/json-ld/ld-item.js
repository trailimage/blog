'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.ListItem
 * @see http://schema.org/ListItem
 */

class ListItemSchema extends ThingSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.listItem; }
		super(type);

		/** @type TI.LinkData.Thing */
		this.item = null;
		/** @type TI.LinkData.ListItem */
		this.nextItem = null;
		/** @type TI.LinkData.ListItem */
		this.previousItem = null;
		/** @type Number|String */
		this.position = null;
	}
}


module.exports = ListItemSchema;