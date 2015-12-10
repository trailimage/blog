'use strict';

const GeoJSON = require('./').Base;

/**
 * @extends {GeoJSON}
 * @see http://geojson.org/geojson-spec.html
 */
class GeoFeature extends GeoJSON {
	constructor() {
		super();

		this.type = GeoJSON.Type.feature;

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

module.exports = GeoFeature;

// - Private static methods ---------------------------------------------------

/**
 * @enum {number}
 * @const
 */
const point = {
	longitude: 0,
	latitude: 1,
	elevation: 2,
	time: 3,
	speed: 4
};

/**
 * Whether two points are at the same location (disregarding elevation)
 * @param {number[]} p1
 * @param {number[]} p2
 * @return {Boolean}
 */
function sameLocation(p1, p2) {
	return p1[point.latitude] == p2[point.latitude]
		 && p1[point.longitude] == p2[point.longitude];
}
function deg2rad(deg) { return (deg * Math.PI / 180.0); }
function rad2deg(rad) {	return (rad * 180.0 / Math.PI); }

