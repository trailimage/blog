'use strict';

const TI = require('../');
const GeoJSON = TI.Map.Base;

/**
 * @extends TI.Map.Base
 * @see http://geojson.org/geojson-spec.html
 * @see https://github.com/mapbox/togeojson
 * @alias TI.Map.FeatureList
 */
class GeoFeatureCollection extends GeoJSON {
	constructor() {
		super();

		this.type = TI.Map.Type.featureCollection;
		/**
		 * @type GeoFeature[]
		 */
		this.features = [];
	}

	/**
	 * @param {String} gpx
	 * @returns TI.Map.FeatureList
	 */
	static parse(gpx) {
		let geo = new GeoFeatureCollection();
		let DOM = require('xmldom').DOMParser;
		/** @type Document */
		let xml = null;

		try {
			xml = new DOM().parseFromString(gpx);
		} catch (ex) {
			log.error(ex.toString());
			return null;
		}

		let tracks = parseNodes(xml, 'trk', TI.Map.Track.parse);
		let routes = parseNodes(xml, 'rte', TI.Map.Route.parse);
		let points = parseNodes(xml, 'wpt', TI.Map.Point.parse);

		geo.features = geo.features.concat(tracks, routes, points);

		return geo;
	}
}

module.exports = GeoFeatureCollection;

// - Private static methods ---------------------------------------------------

/**
 * Use the given parser to parse nodes with given name
 * @param {Document} xml
 * @param {String} name Node name
 * @param {function(TI.Map.Feature)} parser
 * @returns TI.Map.Feature[]
 */
function parseNodes(xml, name, parser) {
	/**
	 * Node list is not ES6 iterable
	 * @type NodeList
	 */
	let nodes = xml.getElementsByTagName(name);
	let features = [];

	for (let i = 0; i < nodes.length; i++) {
		let f = parser(nodes[i]);
		if (f !== null) { features.push(f); }
	}
	return features;
}