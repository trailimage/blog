'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Coordinates
 * @see http://schema.org/GeoCoordinates
 */
class CoordinatesSchema extends ThingSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.coordinates; }

		super(type);

		/**
		 * @type String|Number
		 * @see https://en.wikipedia.org/wiki/World_Geodetic_System
		 */
		this.elevation = null;
		/** @type String|Number */
		this.latitude = null;
		/** @type String|Number */
		this.longitude = null;
		/** @type String */
		this.postalCode = null;
	}
}

module.exports = CoordinatesSchema;