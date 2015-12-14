'use strict';

const GeoJSON = require('./').Base;

/**
 * @extends GeoJSON
 * @see http://geojson.org/geojson-spec.html
 * @alias TI.Map.Coordinates
 */
class GeoCoordinates extends GeoJSON {
	constructor() {
		super();

		/**
		 * @type TI.Map.Geometry
		 */
		this.geometry = null;

		/**
		 * @type String
		 */
		this.id = null;

		/**
		 * @type Object
		 */
		this.properties = null;
	}
}

module.exports = GeoCoordinates;