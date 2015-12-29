'use strict';

const TI = require('../');
const ActionSchema = TI.LinkData.Action;

/**
 * @extends TI.LinkData.Action
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.SearchAction
 * @see http://schema.org/SearchAction
 */
class SearchActionSchema extends ActionSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.searchAction; }

		super(type);

		/** @type String */
		this.query = null;
	}
}

module.exports = SearchActionSchema;