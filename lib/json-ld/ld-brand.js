'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Brand
 * @see http://schema.org/Brand
 */
class BrandSchema extends BaseSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.brand; }

		super(type);

		/** @type TI.LinkData.AggregateRating */
		this.aggregateRating = null;
		/** @type TI.LinkData.Review */
		this.review = null;
		/** @type TI.LinkData.Image|String */
		this.logo = null;
	}
}

module.exports = BrandSchema;