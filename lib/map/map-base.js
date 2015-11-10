'use strict';

const OAuthBase = require('../auth/oauth-base.js');
const db = require('../config.js').provider;
const Point = require('./geo-point.js');
const FeatureCollection = require('./geo-feature-list.js');

/**
 * Manage GPS tracks
 * @extends {OAuthBase}
 */
class MapBase extends OAuthBase {
	constructor() {
		super();

		this.options = {};
		this.needsAuth = false;
	}

	/**
	 * Load all map information (track and photo features) for a post
	 * @param {String} slug
	 * @param {function(CacheItem|Object)} callback Return map item output cache
	 */
	load(slug, callback) {
		db.cache.getObject(key, slug, item => {
			if (item === null) {
				// no cached map -- load or make one
				const library = require('../models/library.js').current;
				let post = library.postWithSlug(slug);

				if (post == null) {
					db.log.error('Post %s not found in library while loading map', slug);
					callback(null);
				} else if (post.triedTrack) {
					// if no track then just create photo features
					this._makePhotoFeatures(new FeatureCollection(), post, callback);
				} else {
					// try to load track
					this._loadGpxFromSource(post, gpx => {
						post.triedTrack = true;

						let geo = (gpx == null) ? new FeatureCollection() : FeatureCollection.parse(gpx);

						// move to the first post in a series
						if (post.isPartial) { while (!post.isSeriesStart) { post = post.previous; } }

						this._makePhotoFeatures(geo, post, callback);
					});
				}
			} else {
				// return cached map
				callback(item);
			}
		});
	}

	/**
	 *
	 * @param {Post} post
	 * @param {function(string)} callback Return GPX string
	 * @private
	 */
	_loadGpxFromSource(post, callback) {}

	/**
	 * Create a GeoFeature from all photos in a post or post series
	 * @param {GeoFeatureCollection} geo
	 * @param {Post} post
	 * @param {function(CacheItem)} callback
	 * @private
	 */
	_makePhotoFeatures(geo, post, callback) {
		// posts don't have photos loaded by default
		db.photo.loadPostPhotos(post, () => {
			// specific slug is needed to link photo back to particular part in series
			let slug = post.isPartial ? post.slug : null;

			geo.features = geo.features.concat(
				post.photos
					.filter(p => p.latitude > 0)
					.map(p => Point.fromPhoto(p, slug))
			);

			if (post.nextIsPart) {
				// repeat for next part
				this._makePhotoFeatures(geo, post.next, callback);
			} else {
				this._saveMap(geo, post, callback);
			}
		});
	}

	/**
	 * Cache GeoJSON
	 * @param {GeoFeatureCollection} geo
	 * @param {Post} post
	 * @param {function(CacheItem)} callback
	 * @private
	 */
	_saveMap(geo, post, callback) {
		let compress = require('zlib');
		let slug = (post.isPartial) ? post.seriesSlug : post.slug;

		compress.gzip(JSON.stringify(geo), (err, buffer) => {
			db.cache.addOutput(key, slug, buffer, callback);
		});
	}
}

module.exports = MapBase;

// - Private static members ---------------------------------------------------

/**
 * Cache key that contains field keys for each cached GPX
 * @type {string}
 */
const key = 'map';