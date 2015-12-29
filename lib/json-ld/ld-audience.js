'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Audience
 * @see http://schema.org/Audience
 */
class AudienceSchema extends BaseSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.audience; }

		super(type);

		/** @type String */
		this.audienceType = null;
		/** @type TI.LinkData.AdminArea */
		this.geographicArea = null;
	}
}

module.exports = AudienceSchema;