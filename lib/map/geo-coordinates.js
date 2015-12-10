'use strict';

const GeoJSON = require('./').Base;

/**
 * @extends {GeoJSON}
 * @see http://geojson.org/geojson-spec.html
 */
class GeoCoordinates extends GeoJSON {
	constructor() {
		super();

		/**
		 * @type {Geometry}
		 */
		this.geometry = null;

		/**
		 * @type {String}
		 */
		this.id = null;

		/**
		 * @type {Object}
		 */
		this.properties = null;
	}
}

module.exports = GeoCoordinates;