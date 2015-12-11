'use strict';

const TI = require('../');
const GeoFeature = TI.Map.Feature;
const GPX = TI.Map.Helper;

/**
 * @extends {GeoFeature}
 * @see http://geojson.org/geojson-spec.html
 * @namespace TI.Map.Point
 */
class Point extends GeoFeature {
	/**
	 * @namespace TI.Map.Point.parse
	 * @param {Node} node GPX node
	 * @returns {TI.Map.Point|Point}
	 */
	static parse(node) {
		let point = new Point();
		let p = GPX.properties(node);

		p.sym = GPX.value(GPX.firstNode(node, 'sym'));

		point.properties = p;
		point.geometry = new TI.Map.Geometry(TI.Map.Type.point, TI.Map.Location.parse(node));

		return point;
	}

	/**
	 * Convert photo to GeoJSON feature
	 * @namespace TI.Map.Point.fromPhoto
	 * @param {TI.Photo} photo
	 * @param {String} [partSlug] Slug to one part in a series
	 * @returns {TI.Map.Point|Point}
	 */
	static fromPhoto(photo, partSlug) {
		let point = new Point();

		point.properties = {
			id: photo.id,
			title: photo.title,
			partSlug: partSlug,
			preview: photo.size.preview.url
		};
		point.geometry = new TI.Map.Geometry(TI.Map.Type.point, [photo.longitude, photo.latitude]);

		return point;
	}
}

module.exports = Point;