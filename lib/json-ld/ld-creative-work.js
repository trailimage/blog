'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.CreativeWork
 * @see http://schema.org/CreativeWork
 */

class CreativeWorkSchema extends BaseSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.creativeWork; }

		super(type);


		/** @type PersonSchema|OrganizationSchema */
		this.author = null;
	}
}


module.exports = CreativeWorkSchema;