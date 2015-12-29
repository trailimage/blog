'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.EntryPoint
 * @see http://schema.org/EntryPoint
 */
class EntryPointSchema extends ThingSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.entryPoint; }

		super(type);

		/** @type TI.LinkData.Application */
		this.actionApplication = null;
		/** @type String */
		this.actionPlatform = null;
		/** @type String */
		this.contentType = null;
		/** @type String */
		this.encodingType = null;
		/** @type String */
		this.httpMethod = null;
	}
}

module.exports = EntryPointSchema;