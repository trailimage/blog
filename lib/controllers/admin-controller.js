'use strict';

const config = require('../config.js');
const template = require('../template.js');
const format = require('../format.js');
const is = require('../is.js');
const library = require('../models/library.js').current;
const db = config.provider;
const Enum = require('../enum.js');
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

		res.cacheKeys(views => {
			if (!is.array(views)) { views = []; }

			if (db.log.queryable) {
				db.log.query(7, 500, logs => { view(res, views, models, logs);	});
			} else {
				view(res, views, models);
			}
		});
	});
};

/**
 *
 * @param res
 * @param {String[]} views
 * @param {String[]} models
 * @param {Object} [logs]
 */
function view(res, views, models, logs) {
	res.set("Cache-Control", "no-cache, no-store, must-revalidate");
	res.set("Pragma", "no-cache");
	res.set("Expires", 0);
	res.render(template.page.administration, {
		logs: logs,
		layout: template.layout.none,
		views: views.sort(),
		models: models.sort(),
		library: library,
		config: config
	});
}

// - Model cache --------------------------------------------------------------

exports.reloadModel = (req, res) => {
	let models = req.body.selected;
	let pending = models.length;
	let affected = [];
	let check = function(keys) {
		affected = affected.concat(keys);
		if (--pending == 0) { reply(res, true, affected.join()); }
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
 * @param {function(String[])} callback Send list of affected keys
 */
function reloadLibrary(callback) {
	db.photo.reloadLibrary(changedSlugs => {
		const menu = require('./menu-controller.js');
		const sitemap = require('./sitemap-controller.js');
		const menuTag = require('./tag-controller.js');
		let keys = changedSlugs.concat([menu.key, sitemap.key, menuTag.key]);

		// remove cached views that are built directly from library
		res.removeFromCache(keys);

		callback(keys);
	});
}

/**
 * Reload photo tags
 * @param {function(String[])} callback Send list of affected keys
 */
function reloadPhotoTags(callback) {
	var photoTag = require('./../models/photo-tag.js');
	// reload tags and directly send JSON response
	photoTag.reload(() => { callback([ModelCache.tagsKey]); });
}

// - View cache ---------------------------------------------------------------

/**
 * Delete output cache item and all related tags
 * @param req
 * @param res
 */
exports.deleteView = (req, res) => {
	const menu = require('./menu-controller.js');
	const sitemap = require('./sitemap-controller.js');
	const menuTag = require('./tag-controller.js');
	// cache keys to be invalidated
	let keys = [menu.key, sitemap.key, menuTag.key];

	for (let k in req.body.form) {
		let slug = req.body.form[k];
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
		reply(res, success, keys.join());
	});
};

// - Common -------------------------------------------------------------------

/**
 * Create standard JSON response closure to AJAX requests
 * @param res
 */
function makeReply(res) { return success => { reply(res, success); } }

/**
 * Send standard JSON response to AJAX request
 * @param res
 * @param {Boolean} success
 * @param {String} [message]
 */
function reply(res, success, message) { res.json({ success: success, message: message }); }