'use strict';

const GeoJSON = require('./geo-base');
const Track = require('./geo-track.js');
const Route = require('./geo-route.js');
const Point = require('./geo-point.js');

/**
 * @extends {GeoJSON}
 * @see http://geojson.org/geojson-spec.html
 * @see https://github.com/mapbox/togeojson
 */
class GeoFeatureCollection extends GeoJSON {
	constructor() {
		super();

		this.type = GeoJSON.Type.featureCollection;
		/**
		 * @type {GeoFeature[]}
		 */
		this.features = [];
	}

	/**
	 * @param {String} gpx
	 * @returns {GeoFeatureCollection}
	 */
	static parse(gpx) {
		let geo = new GeoFeatureCollection();
		let DOM = require('xmldom').DOMParser;
		/** @type {Document} */
		let xml = null;

		try {
			xml = new DOM().parseFromString(gpx);
		} catch (ex) {
			log.error(ex.toString());
			return null;
		}

		let tracks = parseNodes(xml, 'trk', Track.parse);
		let routes = parseNodes(xml, 'rte', Route.parse);
		let points = parseNodes(xml, 'wpt', Point.parse);

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
 * @param {function(GeoFeature)} parser
 * @return {GeoFeature[]}
 */
function parseNodes(xml, name, parser) {
	/**
	 * Node list is not ES6 iterable
	 * @type {NodeList}
	 */
	let nodes = xml.getElementsByTagName(name);
	let features = [];

	for (let i = 0; i < nodes.length; i++) {
		let f = parser(nodes[i]);
		if (f !== null) { features.push(f); }
	}
	return features;
}