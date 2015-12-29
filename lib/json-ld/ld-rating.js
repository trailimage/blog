'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Rating
 * @see http://schema.org/Rating
 */
class RatingSchema extends BaseSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.rating; }

		super(type);

		/** @type String */
		this.ratingValue = null;
		/** @type String|Number */
		this.bestRating = null;
		/** @type String|Number */
		this.worstRating = null;
	}
}

module.exports = RatingSchema;