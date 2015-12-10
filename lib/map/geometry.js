'use strict';

const GeoJSON = require('./index.js').Base;

/**
 * @extends {GeoJSON}
 * @see http://geojson.org/geojson-spec.html
 */
class Geometry extends GeoJSON {
	/**
	 * @param {String} type
	 * @param {Number[]|Number[][]} coordinates
	 */
	constructor(type, coordinates) {
		super();

		this.type = type;
		/**
		 * Locaton coordinates
		 * @type {Number[]|Number[][]}
		 * @example [longitude, latitude, elevation, time, speed]
		 */
		this.coordinates = coordinates;
	}
}

module.exports = Geometry;