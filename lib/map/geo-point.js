'use strict';

const TI = require('../');
const GeoJSON = TI.Map.Base;
const GeoFeature = TI.Map.Feature;
const GPX = TI.Map.Helper;

/**
 * @extends {GeoFeature}
 * @see http://geojson.org/geojson-spec.html
 * @namespace TI.Map.Point
 */
class Point extends GeoFeature {
	/**
	 * @param {Node} node GPX node
	 * @returns {TI.Map.Point}
	 */
	static parse(node) {
		let point = new Point();
		let p = GPX.properties(node);

		p.sym = GPX.value(GPX.firstNode(node, 'sym'));

		point.properties = p;
		point.geometry = new TI.Map.Geometry(GeoJSON.Type.point, Map.Location.parse(node));

		return point;
	}

	/**
	 * Convert photo to GeoJSON feature
	 * @namespace TI.Map.Point.fromPhoto
	 * @param {TI.Photo} photo
	 * @param {String} [partSlug] Slug to one part in a series
	 * @returns {TI.Map.Point}
	 */
	static fromPhoto(photo, partSlug) {
		let point = new Point();

		point.properties = {
			id: photo.id,
			title: photo.title,
			partSlug: partSlug,
			preview: photo.size.preview.url
		};
		point.geometry = new TI.Map.Geometry(GeoJSON.Type.point, [photo.longitude, photo.latitude]);

		return point;
	}
}

module.exports = Point;