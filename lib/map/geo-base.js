'use strict';

/**
 * @see http://geojson.org/geojson-spec.html
 * @namespace TI.Map.Base
 */
class GeoJSON {
	constructor() {
		/**
		 * @type {String}
		 */
		this.type = null;

		/**
		 * @type {TI.Map.Coordinates}
		 */
		this.crs = null;

		/**
		 * @type {TI.Map.Feature[]}
		 */
		this.features = [];

		/**
		 * @type {Array}
		 */
		this.bbox = [];
	}
}

module.exports = GeoJSON;