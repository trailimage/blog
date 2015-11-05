'use strict';

const GeoJSON = require('./geo-base');
const Geometry = require('./geometry.js');
const Line = require('./gpx-line.js');
const GeoFeature = require('./geo-feature');
const GPX = require('./gpx-helper');

/**
 * @extends {GeoFeature}
 * @see http://geojson.org/geojson-spec.html
 */
class Route extends GeoFeature {
	/**
	 * @param {Node} node GPX node
	 * @returns {Route}
	 */
	static parse(node) {
		let r = new Route();

		r.properties = GPX.properties(node);
		r.geometry = new Geometry(GeoJSON.Type.line, Line.parse(node, 'rtept'));

		return r;
	}
}

module.exports = Route;