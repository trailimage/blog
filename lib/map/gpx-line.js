'use strict';

const TI = require('../');
const Map = require('./');

/**
 * Line is not a GeoJSON feature
 * @namespace TI.Map.Line
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

		for (let i = 0; i < points.length; i++) {
			// NodeList is not ES6 iterable
			let p = Map.Location.parse(points[i]);
			if (p != null) { line.push(p); }
		}

		// calculate speed between points
		for (let i = 1; i < line.length; i++) {
			let p1 = line[i];
			let p2 = line[i - 1];
			let t = p1[Map.Location.time] - p2[Map.Location.time];   // milliseconds
			let d = Map.Location.distance(p1, p2);               // miles

			p1[Map.Location.speed] = (t > 0 && d > 0) ? d/(t/TI.enum.time.hour) : 0; // miles per hour
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
			if (lastPoint != null) { length += Map.Location.distance(lastPoint, p); }
			lastPoint = p;
		}
		return length;
	}
}

module.exports = Line;