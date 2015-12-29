'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.List
 * @see http://schema.org/ItemList
 */

class ListSchema extends ThingSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.list; }

		super(type);

		/** @type Number */
		this.numberOfItems = 0;
		/** @type String|TI.LinkData.ListItem[]|TI.LinkData.Thing[] */
		this.itemListElement = null;
		/** @type String */
		this.itemListOrder = null;
	}
}


module.exports = ListSchema;