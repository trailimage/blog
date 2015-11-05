'use strict';

const GeoJSON = require('./geo-base');
const Geometry = require('./geometry.js');
const GeoFeature = require('./geo-feature');
const GPX = require('./gpx-helper');

/**
 * @extends {GeoFeature}
 * @see http://geojson.org/geojson-spec.html
 */
class GeoPoint extends GeoFeature {
	/**
	 * @param {Node} node GPX node
	 * @returns {GeoPoint}
	 */
	static parse(node) {
		let point = new GeoPoint();
		let p = GPX.properties(node);

		p.sym = GPX.value(GPX.firstNode(node, 'sym'));

		point.properties = p;
		point.geometry = new Geometry(GeoJSON.Type.point, GPX.location(node));

		return point;
	}

	/**
	 * Convert Flickr photo to GeoJSON feature
	 * @param {Photo} photo
	 * @param {String} [partSlug] Slug to one part in a series
	 * @returns {GeoPoint}
	 */
	static fromPhoto(photo, partSlug) {
		let point = new GeoPoint();

		point.properties = {
			id: photo.id,
			title: photo.title,
			partSlug: partSlug,
			preview: photo.size.preview.url
		};
		point.geometry = new Geometry(GeoJSON.Type.point, [photo.longitude, photo.latitude]);

		return point;
	}
}

module.exports = GeoPoint;