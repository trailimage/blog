'use strict';

const TI = require('../');
const ProductSchema = TI.LinkData.Product;

/**
 * @extends TI.LinkData.Product
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.ProductModel
 * @see http://schema.org/ProductModel
 */

class ProductModelSchema extends ProductSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.productModel; }
		super(type);

		/** @type TI.LinkData.Product */
		this.isVariantOf = null;
		/** @type TI.LinkData.Product */
		this.successorOf = null;
		/** @type TI.LinkData.Product */
		this.predecessorOf = null;
	}
}


module.exports = ProductModelSchema;