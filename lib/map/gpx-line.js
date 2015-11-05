'use strict';

const Geometry = require('./geometry.js');
const GPX = require('./gpx-helper');
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
		let p = []; // points

		for (let i = 0; i < points.length; i++) {
			p = GPX.location(points[i]);
			if (p != null) { line.push(p); }
		}

		// calculate speed between points
		for (let i = 1; i < line.length; i++) {
			t = line[i][Geometry.Index.time] - line[i - 1][Geometry.Index.time];         // milliseconds
			d = GPX.distance(line[i], line[i - 1]);                                      // miles
			line[i][Geometry.Index.speed] = (t > 0 && d > 0) ? d/(t/Enum.time.hour) : 0; // miles per hour
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
			if (lastPoint) { length += GPX.distance(lastPoint, p); }
			lastPoint = p;
		}
		return length;
	}
}

module.exports = Line;