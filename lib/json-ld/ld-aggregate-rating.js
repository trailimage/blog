'use strict';

const TI = require('../');
const RatingSchema = TI.LinkData.Rating;

/**
 * @extends TI.LinkData.Rating
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.AggregateRating
 * @see http://schema.org/AggregateRating
 */
class AggregateRatingSchema extends RatingSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.aggregateRating; }

		super(type);

		/** @type TI.LinkData.Thing */
		this.itemReviews = null;
		/** @type Number */
		this.ratingCount = 0;
		/** @type Number */
		this.reviewCount = 0;
	}
}

module.exports = AggregateRatingSchema;