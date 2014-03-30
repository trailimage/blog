var setting = require('../settings.js');
var format = require('../format.js');
var library = require('../models/library.js');
var Issue = require('../models/issue.js');
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
	var user = req.cookies.get(key, { signed: true });

	if (format.isEmpty(user) || user != setting.google.userID)
	{
		showLogin(req, res);
	}
	else
	{
		showAdmin(req, res, user);
	}
};

exports.login = function(req, res)
{
	var user = req.body.username;

	if (user == setting.google.userID && req.body.password == setting.google.password)
	{
		res.cookies.set(key, user, { httpOnly: true, expires: new Date(2100, 1), signed: true });
		showAdmin(req, res, user);
	}
	else
	{
		log.warn('Login failed for “%s” from %s', user, req.connection.remoteAddress);
		showLogin(req, res, 'Invalid Credentials');
	}
};

// - Model cache --------------------------------------------------------------

exports.reloadLibrary = function(req, res)
{
	library.reload(function()
	{
		var menu = require('./menu-route.js');
		var sitemap = require('./sitemap-route.js');

		// remove cached views that are built directly from library
		res.deleteKeys([menu.key, sitemap.key]);

		reply(res, true);
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
	for (var k in req.body.data) { keys.push(req.body.data[k]); }

	res.deleteKeys(keys, function(success)
	{
		// remove in-memory post cache from library singleton
		if (success) { library.unload(keys); }
		reply(res, success);
	});
};

// - Issues -------------------------------------------------------------------

exports.saveIssue =     function(req, res) { Issue.fromRequest(req).save(makeReply(res)); };
exports.deleteIssue =   function(req, res) { Issue.fromRequest(req).remove(makeReply(res)); };

/**
 * Create standard JSON response closure to AJAX requests
 * @param res
 */
function makeReply(res) { return function fn(success) { reply(res, success); } }

/**
 * Send standard JSON response to AJAX request
 * @param res
 * @param {Boolean} success
 */
function reply(res, success) { res.json({'success': success }); }

/**
 * @param req
 * @param res
 * @param {String} [message]
 */
function showLogin(req, res, message)
{
	res.render('login', {'message': message, 'layout': layout});
}

function showAdmin(req, res, user)
{
	log.warn('%s (%s) viewing administration', user, req.connection.remoteAddress);

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

		Issue.all(function(issues)
		{
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
						'issues': issues,
						'setting': setting
					});
				});
			});
		});
	});
}

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
			d = new Date(r.timestamp);
			h = d.getHours();
			r.timestamp = format.string('{0}:{1}:{2}.{3} {4}',
				(h > 12) ? h - 12 : h,
				format.leadingZeros(d.getMinutes(), 2),
				format.leadingZeros(d.getSeconds(), 2),
				format.leadingZeros(d.getMilliseconds(), 3),
				(h > 12) ? 'PM' : 'AM');

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

