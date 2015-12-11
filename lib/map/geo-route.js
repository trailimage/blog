'use strict';

const TI = require('../');
const GeoJSON = TI.Map.Base;
const GeoFeature = TI.Map.Feature;
const GPX = TI.Map.Helper;

/**
 * @extends {GeoFeature}
 * @see http://geojson.org/geojson-spec.html
 * @namespace TI.Map.Route
 */
class Route extends GeoFeature {
	/**
	 * @param {Node} node GPX node
	 * @returns {TI.Map.Route}
	 */
	static parse(node) {
		let r = new Route();

		r.properties = GPX.properties(node);
		r.geometry = new TI.Map.Geometry(GeoJSON.Type.line, TI.Map.Line.parse(node, 'rtept'));

		return r;
	}
}

module.exports = Route;