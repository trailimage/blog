'use strict';

const GeoJSON = require('./geo-base');
const Geometry = require('./geometry.js');
const GeoFeature = require('./geo-feature');
const GPX = require('./gpx-helper');

/**
 * @extends {GeoFeature}
 * @see http://geojson.org/geojson-spec.html
 */
class GeoRoute extends GeoFeature {
	/**
	 * @param {Node} node GPX node
	 * @returns {GeoRoute}
	 */
	static parse(node) {
		let r = new GeoRoute();

		r.properties = GPX.properties(node);
		r.geometry = new Geometry(GeoJSON.Type.line, parseLine(node, 'rtept'));

		return r;
	}
}

module.exports = GeoRoute;

/**
 * @param {Node|Element} node
 * @param {String} name
 * @returns {Array} Array of point arrays
 */
function parseLine(node, name) {
	var points = node.getElementsByTagName(name);
	var line = [];
	var t, d, p;

	for (let i = 0; i < points.length; i++) {
		p = parseLocation(points[i]);
		if (p != null) { line.push(p); }
	}

	// add speed to each point
	for (let i = 1; i < line.length; i++) {
		t = line[i][point.time] - line[i - 1][point.time];                  // milliseconds
		d = distance(line[i], line[i - 1]);                                 // miles
		line[i][point.speed] = (t > 0 && d > 0) ? d/(t/Enum.time.hour) : 0; // miles per hour
	}
	return line;
}