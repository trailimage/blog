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
		/**
		 * @alias TI.LinkData.List.itemListElement
		 * @type String[]|TI.LinkData.ListItem[]|TI.LinkData.Thing[]
		 */
		this.itemListElement = null;
		/** @type String */
		this.itemListOrder = null;
	}

	/**
	 * @alias TI.LinkData.List.add
	 * @param {TI.LinkData.ListItem} i
	 */
	add(i) {
		if (this.itemListElement === null) { this.itemListElement = []; }
		this.itemListElement.push(i);
	}
}

module.exports = ListSchema;