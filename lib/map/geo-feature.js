'use strict';

const GeoJSON = require('./geo-base');

/**
 * @extends {GeoJSON}
 * @see http://geojson.org/geojson-spec.html
 */
class GeoFeature extends GeoJSON {
	constructor() {
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

	/**
	 *
	 * @param {Document} xml
	 * @param {String} name
	 * @param {function(Element)} parser
	 * @return {GeoFeature[]}
	 */
	static parseGPX(xml, name, parser) {
		/**
		 * Node list is not ES6 iterable
		 * @type {NodeList}
		 */
		let nodes = xml.getElementsByTagName(name);
		let features = [];

		for (let i = 0; i < nodes.length; i++) {
			let f = parser(nodes[i]);
			if (f !== null) { features.push(f); }
		}
		return features;
	}
}

module.exports = GeoFeature;

// - Private static methods ---------------------------------------------------

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

