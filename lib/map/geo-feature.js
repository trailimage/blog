'use strict';

const TI = require('../');
const GeoJSON = TI.Map.Base;

/**
 * @extends {TI.Map.Base}
 * @see http://geojson.org/geojson-spec.html
 * @namespace TI.Map.Feature
 */
class GeoFeature extends GeoJSON {
	constructor() {
		super();

		this.type = TI.Map.Type.feature;

		/**
		 * @type {TI.Map.Geometry}
		 */
		this.geometry = null;

		/**
		 * @type {String}
		 */
		this.id = null;

		/**
		 * @type {Object}
		 */
		this.properties = null;
	}
}

module.exports = GeoFeature;