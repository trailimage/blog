'use strict';

const config = require('../config.js');
const template = require('../template.js');
const format = require('../format.js');
const is = require('../is.js');
const library = require('../models/library.js').current;
const db = config.provider;
const ModelCache = require('../cache/model-cache.js');

/**
 * Default route action
 * Load both model and output caches
 */
exports.home = (req, res) => {
	db.log.warn('%s viewing administration', format.IPv6(req.connection.remoteAddress));

	db.cache.keys(ModelCache.keyPrefix + '*', models => {
		// sanitize model keys
		if (is.array(models)) {
			for (let i = 0; i < models.length; i++) {
				models[i] = models[i].remove(ModelCache.keyPrefix);
			}
		} else {
			models = [];
		}

		db.map.cacheKeys(maps => {
			res.cacheKeys(views => {
				if (!is.array(views)) { views = []; }

				if (db.log.queryable) {
					db.log.query(7, 500, logs => { pageView(res, views, models, maps, logs); });
				} else {
					pageView(res, views, models, maps);
				}
			});
		});
	});
};

// - Model cache --------------------------------------------------------------

exports.reloadModel = (req, res) => {
	let models = req.body.selected;
	let pending = models.length;
	let affected = [];
	let check = function(keys) {
		affected = affected.concat(keys);
		if (--pending == 0) { jsonView(res, true, affected.join()); }
	};

	for (let m of models) {
		switch (ModelCache.keyPrefix + m) {
			case ModelCache.postsKey: reloadLibrary(check); break;
			case ModelCache.tagsKey: reloadPhotoTags(check); break;
		}
	}
};

/**
 * Reload library from photo provider, usually to find new posts
 * @param {function(String[])} callback Send list of affected cache keys
 */
function reloadLibrary(callback) {
	db.photo.reloadLibrary(changedSlugs => {
		let keys = changedSlugs;

		if (changedSlugs.length > 0) {
			keys = changedSlugs.concat(menuKeys());
			// remove cached views that are built directly from library
			res.removeFromCache(keys);
		}
		keys.sort();
		callback(keys);
	});
}

/**
 * Cache keys for menu views
 * @returns {String[]}
 */
function menuKeys() {
	return [
		template.page.mobileMenuData,
		template.page.postMenuData,
		template.page.tagMenu,
		template.page.sitemap
	];
}

/**
 * Reload photo tags
 * @param {function(String[])} callback Send list of affected keys
 */
function reloadPhotoTags(callback) {
	db.photo.reloadPhotoTags(() => { callback([ModelCache.tagsKey]); });
}

// - View cache ---------------------------------------------------------------

/**
 * Delete output cache item and all related tags
 * @param req
 * @param res
 */
exports.deleteView = (req, res) => {
	// cache keys to be invalidated
	let keys = menuKeys();

	for (let slug of req.body.selected) {
		let p = library.postWithSlug(slug);

		keys.push(slug);

		if (p !== null) {
			// retrieve post related tags
			keys = keys.concat(library.tagSlugs(p.tags));
			if (p.next !== null) { keys.push(p.next.slug); }
			if (p.previous !== null) { keys.push(p.previous.slug); }
		}
	}

	res.removeFromCache(keys, success => {
		// remove in-memory post cache from library singleton
		if (success) { library.unload(keys); }
		keys.sort();
		jsonView(res, success, keys.join());
	});
};

// - Map cache ----------------------------------------------------------------

/**
 * Delete map cache
 * @param req
 * @param res
 */
exports.deleteMap = (req, res) => {
	let slugs = req.body.selected;

	db.map.removeFromCache(slugs, success => {
		if (success) {
			// reset post flag so track is loaded again
			const library = require('../models/library.js').current;

			for (let s of slugs) {
				let p = library.postWithSlug(s);
				if (p !== null) { p.triedTrack = false; }
			}
		}
		slugs.sort();
		jsonView(res, success, slugs.join());
	});
};

// - Common -------------------------------------------------------------------

/**
 *
 * @param res
 * @param {String[]} views
 * @param {String[]} models
 * @param {String[]} maps
 * @param {Object} [logs]
 */
function pageView(res, views, models, maps, logs) {
	res.set("Cache-Control", "no-cache, no-store, must-revalidate");
	res.set("Pragma", "no-cache");
	res.set("Expires", 0);
	res.render(template.page.administration, {
		logs: logs,
		layout: template.layout.none,
		maps: maps.sort(),
		views: views.sort(),
		models: models.sort(),
		library: library,
		config: config
	});
}

/**
 * Send standard JSON response to AJAX request
 * @param res
 * @param {Boolean} success
 * @param {String} [message]
 */
function jsonView(res, success, message) {
	res.json({ success: success, message: message });
}