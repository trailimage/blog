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

	static get type() {
		return {
			point: 'Point',
			line: 'LineString',
			multiLine: 'MultiLineString'
		}
	}
}

module.exports = Geometry;