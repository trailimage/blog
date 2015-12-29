'use strict';

const TI = require('../');
const CreativeWorkSchema = TI.LinkData.CreativeWork;

/**
 * @extends TI.LinkData.CreativeWork
 * @alias TI.LinkData.Review
 * @see http://schema.org/Review
 */
class ReviewSchema extends CreativeWorkSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.review; }

		super(type);

		/** @type String */
		this.reviewBody = null;
		/** @type TI.LinkData.Rating */
		this.reviewRating = null;
		/** @type TI.LinkData.Base */
		this.itemReviewed = null;
	}
}

module.exports = ReviewSchema;