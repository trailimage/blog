'use strict';

const Map = require('./index.js');
const GeoJSON = Map.Base;
const GeoFeature = Map.Feature;
const GPX = Map.Helper;

/**
 * @extends {GeoFeature}
 * @see http://geojson.org/geojson-spec.html
 */
class Point extends GeoFeature {
	/**
	 * @param {Node} node GPX node
	 * @returns {Point}
	 */
	static parse(node) {
		let point = new Point();
		let p = GPX.properties(node);

		p.sym = GPX.value(GPX.firstNode(node, 'sym'));

		point.properties = p;
		point.geometry = new Map.Geometry(GeoJSON.Type.point, Map.Location.parse(node));

		return point;
	}

	/**
	 * Convert photo to GeoJSON feature
	 * @param {Photo} photo
	 * @param {String} [partSlug] Slug to one part in a series
	 * @returns {Point}
	 */
	static fromPhoto(photo, partSlug) {
		let point = new Point();

		point.properties = {
			id: photo.id,
			title: photo.title,
			partSlug: partSlug,
			preview: photo.size.preview.url
		};
		point.geometry = new Map.Geometry(GeoJSON.Type.point, [photo.longitude, photo.latitude]);

		return point;
	}
}

module.exports = Point;