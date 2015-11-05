'use strict';

const GeoBase = require('./geo-base');
const Geometry = require('./geometry.js');
const GeoFeature = require('./geo-feature');
const GPX = require('./gpx-helper');

/**
 * @extends {GeoFeature}
 * @see http://geojson.org/geojson-spec.html
 */
class GeoPoint extends GeoFeature {
	constructor() {
		super();
		this.type = GeoBase.type.feature;
	}

	/**
	 * @param {Node} node
	 * @returns {GeoPoint}
	 */
	static parseGPX(node) {
		let point = new GeoPoint();
		let p = GPX.properties(node);

		p.sym = GPX.value(GPX.firstNode(node, 'sym'));

		point.properties = p;
		point.geometry = new Geometry(Geometry.type.point, GPX.location(node));

		return point;
	}
}

module.exports = GeoPoint;