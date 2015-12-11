'use strict';

const GeoJSON = require('./').Base;

/**
 * @extends {GeoJSON}
 * @see http://geojson.org/geojson-spec.html
 * @namespace TI.Map.Geometry
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