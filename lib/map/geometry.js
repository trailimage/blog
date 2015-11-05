'use strict';

const GeoJSON = require('./geo-base');

/**
 * @extends {GeoJSON}
 * @see http://geojson.org/geojson-spec.html
 */
class Geometry extends GeoJSON {
	/**
	 * @param {String} type
	 * @param {Number[]} coordinates
	 */
	constructor(type, coordinates) {
		this.type = type;
		/**
		 * @type {Number[]}
		 * @exammple [longitude, latitude, elevation, time, speed]
		 */
		this.coordinates = coordinates;
	}

	/**
	 * @returns {Object.<Number>}
	 */
	static get Index() {
		return {
			longitude: 0,
			latitude: 1,
			elevation: 2,
			time: 3,
			speed: 4
		};
	}
}

module.exports = Geometry;