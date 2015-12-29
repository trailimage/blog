'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.ListItem
 * @see http://schema.org/ListItem
 */

class ListItemSchema extends BaseSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.listItem; }
		super(type);

		/** @type TI.LinkData.Base */
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