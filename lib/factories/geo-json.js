'use strict';

const TI = require('./');
const Map = TI.Map;

/**
 */
class GeoJsonFactory {
	/**
	 * Convert photo to GeoJSON feature
	 * @namespace TI.Map.Point.fromPhoto
	 * @param {Blog.Photo} photo
	 * @param {String} [partSlug] Slug to one part in a series
	 * @returns {Blog.Map.Point|Point}
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

	/**
	 * Create map from photo coordinates for posts without GPX tracks
	 * Sort photos by time and exclude those more than X standard deviation older
	 * @param {Blog.Post} post
	 * @param {function(Blog.Map.Track|Track)} callback
	 * @see https://en.wikipedia.org/wiki/Standard_deviation#Basic_examples
	 */
	static fromPost(post, callback) {
		let t = new Track();

		if (!post.photosLoaded)
		{

		}

		for (let p of post.photos) {

		}

		callback(t);
	};
}

// config.map.maxPossibleSpeed

module.exports = GeoJsonFactory;