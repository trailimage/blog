'use strict';

const config = require('../config.js');
const template = require('../template.js');
const format = require('../format.js');
const is = require('../is.js');
const library = require('../models/library.js').current;
const log = config.provider.log;
const cache = config.provider.cache;
const Enum = require('../enum.js');
const ModelCache = require('../cache/model-cache.js');

/**
 * Default route action
 * Load both model and output caches
 */
exports.home = (req, res) => {
	log.warn('%s viewing administration', format.IPv6(req.connection.remoteAddress));

	/** @see https://github.com/flatiron/winston/blob/master/lib/winston/transports/transport.js */
	const options = {
		from: new Date - Enum.time.week,
		rows: 500
	};

	cache.keys(ModelCache.keyPrefix + '*', models => {
		// sanitize model keys
		if (is.array(models)) {
			for (let m of models) { m.remove(ModelCache.keyPrefix); }
		} else {
			models = [];
		}

		res.cacheKeys(views => {
			if (!is.array(views)) { views = []; }

			log.query(options, (err, results) => {
				res.set("Cache-Control", "no-cache, no-store, must-revalidate");
				res.set("Pragma", "no-cache");
				res.set("Expires", 0);
				res.render(template.page.administration, {
					logs: parseLogs(results),
					layout: template.layout.none,
					views: views.sort(),
					models: models.sort(),
					library: library,
					config: config
				});
			});
		});
	});
};

// - Tracks -------------------------------------------------------------------

exports.uploadTrack = (req, res) => {
	let formidable = require('formidable');
	let form = new formidable.IncomingForm();

	form.parse(req, (err, fields, files) => {
		let gpx = files['gpx'];
		let post = library.postWithID(fields['post']);

		if (is.value(post)) {
			let fs = require('fs');

			fs.readFile(gpx.path, 'utf8', (err, data) => {
				if (err) {
					log.error('Unable to read %s: %s', gpx.path, err.toString());
					reply(res, false);
				} else {
					let Map = require('./../models/map.js');
					let map = new Map();
					map.saveGPX(data, post, success => { reply(res, success); });
				}
			});
		} else {
			fs.unlink(gpx.path, err => {
				log.error('Failed to delete %s: %s', gpx.path, err.toString());
				reply(res, false);
			});
		}
	});

};

// - Model cache --------------------------------------------------------------

/**
 * Reload library from Flickr, usually to find new posts
 * @param req
 * @param res
 */
exports.reloadLibrary = (req, res) => {
	library.reload(changedSlugs => {
		const menu = require('./menu-controller.js');
		const sitemap = require('./sitemap-controller.js');
		const menuTag = require('./tag-controller.js');
		let keys = changedSlugs.concat([menu.key, sitemap.key, menuTag.key]);

		// remove cached views that are built directly from library
		res.deleteKeys(keys);

		// return keys for display in an alert message
		reply(res, true, keys.join());
	});
};

exports.reloadPhotoTags = (req, res) => {
	var photoTag = require('./../models/photo-tag.js');
	// reload tags and directly send JSON response
	photoTag.reload(() => { reply(res, true); });
};

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

	res.deleteKeys(keys, success => {
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

/**
 * Group logs by day
 * @param {Object} results
 * @return {Object}
 */
function parseLogs(results) {
	let grouped = {};

	if (is.defined(results,'redis')) {
		let day = null;
		let dayKey = null;

		for (let r of results.redis) {
			if (is.defined(r,'message') && is.value(r.message)) {
				r.message = r.message.replace(/"(\d{10,11})"/, '<a href="http://flickr.com/photo.gne?id=$1">$1</a>');
			} else {
				r.message = '[no message]';
			}
			let d = new Date(r.timestamp);
			if (config.isProduction) { d = new Date(d.getTime() + (config.timezone * Enum.time.hour)); }
			let h = d.getHours();

			r.timestamp = format.string('{0}:{1}:{2}.{3} {4}',
				(h > 12) ? h - 12 : h,
				format.leadingZeros(d.getMinutes(), 2),
				format.leadingZeros(d.getSeconds(), 2),
				format.leadingZeros(d.getMilliseconds(), 3),
				(h >= 12) ? 'PM' : 'AM');

			if (!sameDay(day, d)) {
				day = d;
				dayKey = format.string('{0}, {1} {2}', Enum.weekday[d.getDay()], Enum.month[d.getMonth()], d.getDate());
				grouped[dayKey] = [];
			}
			grouped[dayKey].push(r);
		}
	}
	return grouped;
}

/**
 * Whether two timestamps are the same day
 * @param {Date} d1
 * @param {Date} d2
 * @returns {boolean}
 */
function sameDay(d1, d2) {
	return (
		d1 != null &&
		d2 != null &&
		d1.getMonth() == d2.getMonth() &&
		d1.getDate() == d2.getDate());
}