'use strict';

const Geometry = require('./geometry.js');
const GPX = require('./gpx-helper');
const Location = require('./gpx-location.js');
const Enum = require('../enum.js');

/**
 * Line is not a GeoJSON feature
 */
class Line {
	/**
	 * @param {Node|Element} node
	 * @param {String} name
	 * @returns {Number[]} Array of point arrays
	 */
	static parse(node, name) {
		let points = node.getElementsByTagName(name);
		let line = [];
		let t = 0;  // time
		let d = 0;  // duration

		for (let i = 0; i < points.length; i++) {
			// NodeList is not ES6 iterable
			let p = Location.parse(points[i]);
			if (p != null) { line.push(p); }
		}

		// calculate speed between points
		for (let i = 1; i < line.length; i++) {
			let p1 = line[i];
			let p2 = line[i - 1];

			t = p1[Location.time] - p2[Location.time];   // milliseconds
			d = Location.distance(p2, p2);               // miles

			p1[Location.speed] = (t > 0 && d > 0) ? d/(t/Enum.time.hour) : 0; // miles per hour
		}
		return line;
	}

	/**
	 * Total distance between points in a line
	 * @param {Array} points
	 */
	static length(points) {
		let length = 0;
		let lastPoint = null;

		for (let p of points) {
			if (lastPoint != null) { length += Location.distance(lastPoint, p); }
			lastPoint = p;
		}
		return length;
	}
}

module.exports = Line;