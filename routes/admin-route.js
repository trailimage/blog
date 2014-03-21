var Setting = require('../settings.js');
var Format = require('../format.js');
/** @type {singleton} */
var Cloud = require('../adapters/redis.js');
/** @type {Library} */
var Library = require('../models/library.js');
/** @type {singleton} */
var Output = require('../adapters/output.js');
var log = require('winston');
var Enum = require('../enum.js');
var layout = 'layouts/admin';
var key = 'auth';

/**
 * Default route action
 * @see http://expressjs.com/api.html#res.cookie
 * @see http://expressjs.com/api.html#req.cookies
 */
exports.home = function(req, res)
{
	var user = req.cookies.get(key, { signed: true });

	if (Format.isEmpty(user) || user != Setting.google.userID)
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

	if (user == Setting.google.userID && req.body.password == Setting.google.password)
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

exports.newIssue = function(req, res)
{
	Cloud.current.addHashItem(Enum.key.issues, req.query.slug, req.query.docID, function(success)
	{
		res.json({'success': success });
	}, 1);
};

exports.saveIssue = function(req, res)
{
	Cloud.current.addHashItem(Enum.key.issues, req.query.slug, req.query.docID, function(success)
	{
		res.json({'success': success });
	}, 0);
};

exports.deleteIssue = function(req, res)
{
	res.json({msgId: 'success' });
};

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
	//log.warn('%s (%s) viewing administration', user, req.connection.remoteAddress);

	/** @see https://github.com/flatiron/winston/blob/master/lib/winston/transports/transport.js */
	var options =
	{
		from: new Date - Enum.time.week,
		rows: 500
	};

	Cloud.current.getHash(Enum.key.issues, function(issues)
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
				'library': Library.current,
				'issues': issues,
				'setting': Setting
			});
		});
	});
}

/**
 *
 * @param {Object} results
 * @return {Object}
 */
function parseLogs(results)
{
	var grouped = {};
	var day = null;
	var dayKey = null;
	var r, d, h = null;

	for (var i = 0; i < results.redis.length; i++)
	{
		r = results.redis[i];
		d = new Date(r.timestamp);
		h = d.getHours();
		r.timestamp = Format.string('{0}:{1}:{2}.{3} {4}',
			(h > 12) ? h - 12 : h,
			Format.leadingZeros(d.getMinutes(), 2),
			Format.leadingZeros(d.getSeconds(), 2),
			Format.leadingZeros(d.getMilliseconds(), 3),
			(h > 12) ? 'PM' : 'AM');

		if (!sameDay(day, d))
		{
			day = d;
			dayKey = Format.string('{0}, {1} {2}', Enum.weekday[d.getDay()], Enum.month[d.getMonth()], d.getDate());
			grouped[dayKey] = [];
		}
		grouped[dayKey].push(r);
	}
	return grouped;
}

/**
 * Whether two string timestamps are the same day
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

