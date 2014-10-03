var setting = require('../settings.js');
var format = require('../format.js');
var library = require('../models/library.js');
var log = require('winston');
var Enum = require('../enum.js');
var layout = 'layouts/admin';
var modelPrefix = 'model:';
var key = 'auth';

/**
 * Default route action
 * @see http://expressjs.com/api.html#res.cookie
 * @see http://expressjs.com/api.html#req.cookies
 */
exports.home = function(req, res)
{
	log.warn('%s viewing administration', req.connection.remoteAddress);

	/** @see https://github.com/flatiron/winston/blob/master/lib/winston/transports/transport.js */
	var options =
	{
		from: new Date - Enum.time.week,
		rows: 500
	};

	var db = require('./../adapters/hash.js');

	db.keys(modelPrefix + '*', function(models)
	{
		// sanitize model keys
		for (var i = 0; i < models.length; i++) { models[i] = models[i].replace(modelPrefix, ''); }

		res.cacheKeys(function(views)
		{
			log.query(options, function(err, results)
			{
				res.set("Cache-Control", "no-cache, no-store, must-revalidate");
				res.set("Pragma", "no-cache");
				res.set("Expires", 0);
				res.render('admin',
				{
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

exports.uploadTrack = function(req, res)
{
	var formidable = require('formidable');
	var form = new formidable.IncomingForm();

	form.parse(req, function(err, fields, files)
	{
		var gpx = files['gpx'];
		var post = library.postWithID(fields['post']);

		if (post != null)
		{
			var fs = require('fs');

			fs.readFile(gpx.path, 'utf8', function(err, data)
			{
				if (err)
				{
					log.error('Unable to read %s: %s', gpx.path, err.toString());
					reply(res, false);
				}
				else
				{
					var map = require('./../models/map.js');
					map.saveGPX(data, post, function(success) { reply(res, success); });
				}
			});
		}
		else
		{
			fs.unlink(gpx.path, function(err)
			{
				log.error('Failed to delete %s: %s', gpx.path, err.toString());
				reply(res, false);
			});
		}
	});

};

// - Model cache --------------------------------------------------------------

exports.reloadLibrary = function(req, res)
{
	library.reload(function(changedSlugs)
	{
		var menu = require('./menu-controller.js');
		var sitemap = require('./sitemap-controller.js');
		var menuTag = require('./tag-controller.js');
		var slugs = changedSlugs.concat([menu.key, sitemap.key, menuTag.key]);

		// remove cached views that are built directly from library
		res.deleteKeys(slugs);

		reply(res, true, slugs.join());
	});
};

exports.reloadPhotoTags = function(req, res)
{
	var photoTag = require('./../models/photo-tag.js');
	photoTag.reload(function() { reply(res, true); });
};

// - View cache ---------------------------------------------------------------

/**
 * Delete output cache item
 * @param req
 * @param res
 */
exports.deleteView = function(req, res)
{
	var keys = [];
	for (var k in req.body.form) { keys.push(req.body.form[k]); }

	res.deleteKeys(keys, function(success)
	{
		// remove in-memory post cache from library singleton
		if (success) { library.unload(keys); }
		reply(res, success);
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
function parseLogs(results)
{
	var grouped = {};
	var day = null;
	var dayKey = null;
	var r, d, h = null;

	if (results.hasOwnProperty('redis'))
	{
		for (var i = 0; i < results.redis.length; i++)
		{
			r = results.redis[i];
			r.message = r.message.replace(/"(\d{10,11})"/, '<a href="http://flickr.com/photo.gne?id=$1">$1</a>');
			d = new Date(r.timestamp);

			if (setting.isProduction)
			{
				d = new Date(d.getTime() + (setting.timezone * Enum.time.hour));
			}

			h = d.getHours();
			r.timestamp = format.string('{0}:{1}:{2}.{3} {4}',
				(h > 12) ? h - 12 : h,
				format.leadingZeros(d.getMinutes(), 2),
				format.leadingZeros(d.getSeconds(), 2),
				format.leadingZeros(d.getMilliseconds(), 3),
				(h >= 12) ? 'PM' : 'AM');

			if (!sameDay(day, d))
			{
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
function sameDay(d1, d2)
{
	return (
		d1 != null &&
		d2 != null &&
		d1.getMonth() == d2.getMonth() &&
		d1.getDate() == d2.getDate());
}

