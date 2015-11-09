'use strict';

const OAuthBase = require('../auth/oauth-base.js');
const config = require('../config.js');
const Point = require('../map/geo-point.js');
const FeatureCollection = require('../map/geo-feature-list.js');

/**
 * Manage GPS tracks
 * @extends {OAuthBase}
 */
class TrackBase extends OAuthBase {
	constructor() {
		this.options = {};
		this.needsAuth = false;
	}

	/**
	 * Load all map information (track and photo features) for a post
	 * @param {String} slug
	 * @param {function(Object)} callback Return map item
	 */
	loadMap(slug, callback) {
		config.provider.cache.getObject(key, slug, item => {
			if (item === null) {
				// no cached map -- load or make one
				const library = require('../models/library.js').current;
				const post = library.postWithSlug(slug);

				if (post.triedTrack) {
					// if no track then just create photo features
					this._makePhotoFeatures(new FeatureCollecction(), post, callback);
				} else {
					// try to load track
					this._loadGeoFromSource(post, (err, content) => {

					});
				}
			} else {
				// return cached
				callback(item);
			}
		});
	}

	/**
	 * @param {Post} post
	 * @param {function(Boolean)} callback
	 */
	makeGeo(post, callback) {
		this._getPhotos(new FeatureCollection(), post, callback);
	}

	/**
	 *
	 * @param {Post} post
	 * @private
	 */
	_loadGeoFromSource(post, callback) {}

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
	_makePhotoFeatures(geo, post, callback) {
		config.provider.photo.loadPostPhotos(post, () => {
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
				this._saveMap(geo, post, callback);
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
	_saveMap(geo, post, callback) {
		let compress = require('zlib');
		let slug = (post.isPartial) ? post.seriesSlug : post.slug;

		compress.gzip(JSON.stringify(geo), (err, buffer) => {
			config.provider.cache.addOutput(key, slug, buffer, callback);
		});
	}
}

module.exports = TrackBase;

// - Private static members ---------------------------------------------------

/**
 * Cache key that contains field keys for each cached GPX
 * @type {string}
 */
const key = 'map';