'use strict';

const OAuthBase = require('../auth/oauth-base.js');
const config = require('../config.js');
const db = config.provider;
const Point = require('./geo-point.js');
const FeatureCollection = require('./geo-feature-list.js');

/**
 * Manage GPS tracks
 * @extends {OAuthBase}
 */
class GpxBase extends OAuthBase {
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
		if (config.cacheOutput) {
			db.cache.getObject(key, slug, item => {
				if (item === null) {
					this._make(slug, callback);
				} else {
					// return cached map
					callback(item);
				}
			});
		} else {
			this._make(slug, callback);
		}
	}

	/**
	 * Build map information
	 * @param {String} slug
	 * @param {function(CacheItem|Object)} callback Return map item output cache
	 * @private
	 */
	_make(slug, callback) {
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
			this.loadGPX(post, gpx => {
				// set the flag so we don't try repeatedly
				post.triedTrack = true;

				let geo = (gpx == null) ? new FeatureCollection() : FeatureCollection.parse(gpx);

				// move to the first post in a series
				if (post.isPartial) { while (!post.isSeriesStart) { post = post.previous; } }

				this._makePhotoFeatures(geo, post, callback);
			});
		}
	}

	/**
	 * Return GPX as string or stream to response
	 * @param {Post} post
	 * @param {function(String)|ServerResponse} callback Return GPX string
	 */
	loadGPX(post, callback) { callback(null); }

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

			geo.features = geo.features.concat(post.photos
				.filter(p => p.latitude > 0)
				.map(p => Point.fromPhoto(p, slug)));

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
			db.log.info('Loaded and compressed GeoJSON for "%s"', post.title);
			db.cache.addOutput(key, slug, buffer, callback);
		});
	}

	/**
	 * All keys for cached outputs
	 * @param {function(String[])} callback
	 */
	cacheKeys(callback) { db.cache.keys(key, callback); };

	/**
	 * Remove items from cache
	 * @param {String[]} keys
	 * @param {function(boolean)} [callback]
	 */
	removeFromCache(keys, callback) { db.cache.remove(key, keys, callback); };
}

module.exports = GpxBase;

// - Private static members ---------------------------------------------------

/**
 * Cache key that contains field keys for each cached GPX
 * @type {string}
 */
const key = 'map';