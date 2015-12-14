'use strict';

const TI = require('../');
const GeoFeature = TI.Map.Feature;
const GPX = TI.Map.Helper;

/**
 * @extends GeoFeature
 * @see http://geojson.org/geojson-spec.html
 * @alias TI.Map.Route
 */
class Route extends GeoFeature {
	/**
	 * @namespace TI.Map.Route.parse
	 * @param {Node} node GPX node
	 * @returns TI.Map.Route
	 */
	static parse(node) {
		let r = new Route();

		r.properties = GPX.properties(node);
		r.geometry = new TI.Map.Geometry(TI.Map.Type.line, TI.Map.Line.parse(node, 'rtept'));

		return r;
	}
}

module.exports = Route;