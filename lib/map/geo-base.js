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

	static get Type() {
		return {
			feature: 'Feature',
			featureCollection: 'FeatureCollection',
			point: 'Point',
			line: 'LineString',
			multiLine: 'MultiLineString'
		}
	}
}

module.exports = GeoJSON;