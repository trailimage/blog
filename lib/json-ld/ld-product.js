'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Product
 * @see http://schema.org/Product
 */
class ProductSchema extends ThingSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.product; }
		super(type);

		/** @type String */
		this.productID = null;
		/** @type String */
		this.sku = null;
		/** @type TI.LinkData.AggregateRating */
		this.aggregateRating = null;
		/** @type TI.LinkData.Audience */
		this.audience = null;
		/** @type TI.LinkData.Brand|TI.LinkData.Organization */
		this.brand = null;
		/** @type String */
		this.color = null;
		/** @type Number */
		this.depth = 0;
		/** @type Number */
		this.height = 0;
		/** @type Number */
		this.width = 0;
		/** @type TI.LinkData.Review */
		this.review = null;
		/** @type TI.LinkData.Product[] */
		this.isConsumableFor = null;
		/** @type TI.LinkData.Product[] */
		this.isRelatedTo = null;
		/** @type TI.LinkData.Product[] */
		this.isSimilarTo = null;
		/** @type TI.LinkData.Image|String */
		this.logo = null;
		/** @type TI.LinkData.Organization */
		this.manufacturer = null;
		/** @type TI.LinkData.ProductModel|String */
		this.model = null;
	}
}

module.exports = ProductSchema;