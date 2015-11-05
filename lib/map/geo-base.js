'use strict';

/**
 * @see http://geojson.org/geojson-spec.html
 */
class GeoJSON {
	constructor() {
		/**
		 * @type {String}
		 */
		this.type = null;

		/**
		 * @type {GeoCoordinates}
		 */
		this.crs = null;

		/**
		 * @type {GeoFeature[]}
		 */
		this.features = [];

		/**
		 * @type {Array}
		 */
		this.bbox = [];
	}

	static get type() {
		return {
			feature: 'Feature'
		}
	}
}

module.exports = GeoJSON;