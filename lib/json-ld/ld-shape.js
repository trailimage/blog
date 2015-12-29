'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Shape
 * @see http://schema.org/GeoShape
 */
class ShapeSchema extends BaseSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.shape; }

		super(type);

		/**
		 * two points separated by a space character
		 * @type String
		 */
		this.box = null;

		/**
		 * a pair followed by a radius in meters
		 * @type String
		 */
		this.circle = null;

		/**
		 * series of two or more point objects separated by space
		 * @type String
		 */
		this.line = null;

		/**
		 * a series of four or more space delimited points where the first and final points are identical
		 * @type String
		 */
		this.polygon = null;

		/**
		 * @type String|Number
		 * @see https://en.wikipedia.org/wiki/World_Geodetic_System
		 */
		this.elevation = null;
	}
}

module.exports = ShapeSchema;