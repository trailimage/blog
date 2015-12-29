'use strict';

const TI = require('../');
const CreativeWorkSchema = TI.LinkData.CreativeWork;

/**
 * @extends TI.LinkData.CreativeWork
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.WebSite
 * @see http://schema.org/WebSite
 */
class WebSiteSchema extends CreativeWorkSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.webSite; }
		super(type);
	}
}


module.exports = WebSiteSchema;