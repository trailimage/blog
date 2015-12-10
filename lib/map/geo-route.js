'use strict';

const Map = require('./index.js');
const GeoJSON = Map.Base;
const GeoFeature = Map.Feature;
const GPX = Map.Helper;

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
		r.geometry = new Map.Geometry(GeoJSON.Type.line, Map.Line.parse(node, 'rtept'));

		return r;
	}
}

module.exports = Route;