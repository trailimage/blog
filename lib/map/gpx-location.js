'use strict';

const app = require('../index.js');
const Map = require('./index.js');
const GPX = Map.Helper;
const config = app.config;
const is = app.is;

/**
 *  Location as [longitude, latitude, elevation, time, speed]
 */
class Location {
	/**
	 * Return location as [longitude, latitude, elevation, time, speed]
	 * A degree of latitude is approximately 69 miles
	 * A degree of longitude is about 69 miles at the equater, 0 at the poles
	 * @param {Node|Element} node
	 * @returns {Number[]}
	 * @see http://nationalatlas.gov/articles/mapping/a_latlong.html
	 */
	static parse(node) {
		/** @type {Number[]} */
		let location = new Array(5);
		let elevation = GPX.firstNode(node, 'ele');                     // meters
		let t = GPX.firstNode(node, 'time');                            // UTC

		// decimal degrees
		location[Location.longitude] = GPX.numberAttribute(node, 'lon');
		location[Location.latitude] = GPX.numberAttribute(node, 'lat');

		// exclude points close to home
		if (config.map.checkPrivacy && Location.distance(location, config.map.privacyCenter) < config.map.privacyMiles) { return null; }

		if (is.value(elevation)) {
			let m = parseFloat(GPX.value(elevation));
			// convert meters to whole feet
			location[Location.elevation] = Math.round(m * 3.28084);
		}

		if (is.value(t)) {
			let d = new Date(GPX.value(t));
			location[Location.time] = d.getTime();
		}

		location[Location.speed] = 0;

		return location;
	}

	/**
	 * Distance in miles between geographic points
	 * South latitudes are negative, east longitudes are positive
	 * @param {number[]} p1 [longitude, latitude, elevation, time]
	 * @param {number[]} p2
	 * @return {number}
	 * @see http://stackoverflow.com/questions/3694380/calculating-distance-between-two-points-using-latitude-longitude-what-am-i-doi
	 * @see http://www.geodatasource.com/developers/javascript
	 */
	static distance(p1, p2) {
		if (Location.same(p1, p2)) { return 0; }

		var theta = p1[Location.longitude] - p2[Location.longitude];
		var d = Math.sin(deg2rad(p1[Location.latitude])) * Math.sin(deg2rad(p2[Location.latitude]))
			   + Math.cos(deg2rad(p1[Location.latitude])) * Math.cos(deg2rad(p2[Location.latitude])) * Math.cos(deg2rad(theta));

		if (d >= -1 && d <= 1) {
			d = Math.acos(d);
			d = rad2deg(d);
			d = d * 60 * 1.1515;    // miles
		} else {
			d = 0;
		}
		return d;
	}

	/**
	 * Whether two points are at the same location (disregarding elevation)
	 * @param {number[]} p1
	 * @param {number[]} p2
	 * @return {Boolean}
	 */
	static same(p1, p2) {
		return p1[Location.latitude] == p2[Location.latitude]
			 && p1[Location.longitude] == p2[Location.longitude];
	}

}

Location.longitude = 0;
Location.latitude = 1;
Location.elevation = 2;
Location.time = 3;
Location.speed = 4;

module.exports = Location;

// - Private static methods ---------------------------------------------------

/**
 * Convert degrees to radians
 * @param {Number} deg
 * @returns {Number}
 */
function deg2rad(deg) { return (deg * Math.PI / 180.0); }

/**
 * Convert radians to degrees
 * @param {Number} rad
 * @returns {Number}
 */
function rad2deg(rad) {	return (rad * 180.0 / Math.PI); }