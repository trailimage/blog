"use strict";

var setting = require('../settings.js');
var format = require('../format.js');
var library = require('../models/library.js');
var log = require('winston');
var Enum = require('../enum.js');
const layout = 'layouts/admin';
const modelPrefix = 'model:';
const key = 'auth';

/**
 * Default route action
 * @see http://expressjs.com/api.html#res.cookie
 * @see http://expressjs.com/api.html#req.cookies
 */
exports.home = function(req, res) {
	log.warn('%s viewing administration', req.connection.remoteAddress);

	/** @see https://github.com/flatiron/winston/blob/master/lib/winston/transports/transport.js */
	const options = {
		from: new Date - Enum.time.week,
		rows: 500
	};

	var db = require('./../adapters/hash.js');

	db.keys(modelPrefix + '*', function(models) {
		// sanitize model keys
		for (let i = 0; i < models.length; i++) { models[i] = models[i].replace(modelPrefix, ''); }

		res.cacheKeys(function(views) {
			log.query(options, function(err, results) {
				res.set("Cache-Control", "no-cache, no-store, must-revalidate");
				res.set("Pragma", "no-cache");
				res.set("Expires", 0);
				res.render('admin', {
					'logs': parseLogs(results),
					'layout': layout,
					'views': views.sort(),
					'models': models.sort(),
					'library': library,
					'setting': setting
				});
			});
		});
	});
};

// - Tracks -------------------------------------------------------------------

exports.uploadTrack = function(req, res) {
	var formidable = require('formidable');
	var form = new formidable.IncomingForm();

	form.parse(req, function(err, fields, files) {
		let gpx = files['gpx'];
		let post = library.postWithID(fields['post']);

		if (post != null) {
			let fs = require('fs');

			fs.readFile(gpx.path, 'utf8', function(err, data) {
				if (err) {
					log.error('Unable to read %s: %s', gpx.path, err.toString());
					reply(res, false);
				} else {
					let map = require('./../models/map.js');
					map.saveGPX(data, post, function(success) { reply(res, success); });
				}
			});
		} else {
			fs.unlink(gpx.path, function(err) {
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
exports.reloadLibrary = function(req, res) {
	library.reload(function(changedSlugs) {
		let menu = require('./menu-controller.js');
		let sitemap = require('./sitemap-controller.js');
		let menuTag = require('./tag-controller.js');
		let keys = changedSlugs.concat([menu.key, sitemap.key, menuTag.key]);

		// remove cached views that are built directly from library
		res.deleteKeys(keys);

		// return keys for display in an alert message
		reply(res, true, keys.join());
	});
};

exports.reloadPhotoTags = function(req, res) {
	var photoTag = require('./../models/photo-tag.js');
	photoTag.reload(function() { reply(res, true); });
};

// - View cache ---------------------------------------------------------------

/**
 * Delete output cache item and all related tags
 * @param req
 * @param res
 */
exports.deleteView = function(req, res) {
	var menu = require('./menu-controller.js');
	var sitemap = require('./sitemap-controller.js');
	var menuTag = require('./tag-controller.js');
	var keys = [menu.key, sitemap.key, menuTag.key];

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

	res.deleteKeys(keys, function(success) {
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
function makeReply(res) { return function fn(success) { reply(res, success); } }

/**
 * Send standard JSON response to AJAX request
 * @param res
 * @param {Boolean} success
 * @param {String} [message]
 */
function reply(res, success, message) { res.json({'success': success, 'message': message }); }

/**
 * Group logs by day
 * @param {Object} results
 * @return {Object}
 */
function parseLogs(results) {
	var grouped = {};
	var day = null;
	var dayKey = null;
	var r, d, h = null;

	if (results.hasOwnProperty('redis')) {
		for (let i = 0; i < results.redis.length; i++) {
			r = results.redis[i];
			if (r.hasOwnProperty('message') && r.message !== null) {
				r.message = r.message.replace(/"(\d{10,11})"/, '<a href="http://flickr.com/photo.gne?id=$1">$1</a>');
			} else {
				r.message = '[no message]';
			}
			d = new Date(r.timestamp);

			if (setting.isProduction) {
				d = new Date(d.getTime() + (setting.timezone * Enum.time.hour));
			}

			h = d.getHours();
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