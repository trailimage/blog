'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.List
 * @see http://schema.org/ItemList
 */

class ListSchema extends BaseSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.list; }

		super(type);

		/** @type Number */
		this.numberOfItems = 0;
		/** @type String|TI.LinkData.ListItem|TI.LinkData.Base */
		this.itemListElement = null;
		/** @type String */
		this.itemListOrder = null;
	}
}


module.exports = ListSchema;