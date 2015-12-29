'use strict';

const TI = require('../');
const CreativeWorkSchema = TI.LinkData.CreativeWork;

/**
 * @extends TI.LinkData.CreativeWork
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Photograph
 * @see http://schema.org/Photograph
 */

class PhotographSchema extends CreativeWorkSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.photograph; }
		super(type);
	}
}


module.exports = PhotographSchema;