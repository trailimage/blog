'use strict';

const config = require('../config.js');
const format = require('../format.js');
const is = require('../is.js');
const Point = require('./geo-point.js');
const FeatureCollection = require('./geo-feature-list.js');

class TrailMap {
	constructor() {
		/**
		 * @type {GeoJSON}
		 */
		this.json = null;
	}

	/**
	 *
	 * @param {string} slug
	 * @param {function(Boolean|Object)} callback
	 */
	loadGPX(slug, callback) {
		config.provider.cache.getObject(key, slug, callback);
	};

	/**
	 * @param {Post} post
	 * @param {function(Boolean)} callback
	 */
	makeGPX(post, callback) {
		this._getPhotos(new FeatureCollection(), post, callback);
	}

	/**
	 * @param {String} gpx
	 * @param {Post} post
	 * @param {function(Boolean)} callback
	 */
	saveGPX(gpx, post, callback) {
		let geo = FeatureCollection.parse(gpx);

		if (geo === null) { callback(false); return; }
		// move to the first post in a series
		if (post.isPartial) { while (!post.isSeriesStart) { post = post.previous; } }

		this._getPhotos(geo, post, callback);
	};

	/**
	 * Add photos from every post in a series then save
	 * @param {GeoFeatureCollection} geo
	 * @param {Post} post
	 * @param {function(Boolean)} callback
	 * @private
	 */
	_getPhotos(geo, post, callback) {
		config.provider.data.loadPostPhotos(post, () => {
			// specific slug is needed to link photo back to particular part in series
			let slug = post.isPartial ? post.slug : null;

			geo.features = geo.features.concat(
				post.photos
					.filter(p => p.latitude > 0)
					.map(p => Point.fromPhoto(p, slug))
			);

			if (post.nextIsPart) {
				this._getPhotos(geo, post.next, callback);
			} else {
				this._save(geo, post, callback);
			}
		});
	}

	/**
	 * Add photos from every post in a series
	 * @param {GeoFeatureCollection} geo
	 * @param {Post} post
	 * @param {function(Boolean)} callback
	 * @private
	 */
	_save(geo, post, callback) {
		let compress = require('zlib');
		let slug = (post.isPartial) ? post.seriesSlug : post.slug;

		compress.gzip(JSON.stringify(geo), (err, buffer) => {
			config.provider.cache.add(key, slug, {
				'buffer': buffer.toString('hex'),
				'eTag': slug + '_map_' + (new Date()).getTime().toString()
			}, callback);
		});
	}
}

module.exports = TrailMap;

// - Private static members ---------------------------------------------------

/**
 * Cache key that contains field keys for each cached GPX
 * @type {string}
 */
const key = 'map';