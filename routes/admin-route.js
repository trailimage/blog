var Setting = require('../settings.js');
var Format = require('../format.js');
/** @type {singleton} */
var Output = require('../output.js');
var log = require('winston');
var Enum = require('../enum.js');
var layout = 'layouts/admin';

/**
 * Default route action
 * @see http://expressjs.com/api.html#res.cookie
 * @see http://expressjs.com/api.html#req.cookies
 */
exports.home = function(req, res)
{
	if (Format.isEmpty(req.cookies.user))
	{
		showLogin(req, res);
	}
	else
	{
		showAdmin(req, res);
	}
};

exports.login = function(req, res)
{
	if (req.body.username == Setting.google.userID && req.body.password == Setting.google.password)
	{
		res.cookie('user', req.body.username, { secure: true });
		showAdmin(req, res);
	}
	else
	{
		log.warn('Login failed for “%s” from %s', req.body.username, req.connection.remoteAddress);
		showLogin(req, res, 'Invalid Credentials');
	}
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

function showAdmin(req, res)
{
	log.warn('%s viewing administration', req.connection.remoteAddress);

	/** @see https://github.com/flatiron/winston/blob/master/lib/winston/transports/transport.js */
	var options =
	{
		from: new Date - Enum.time.week,
		rows: 5000
	};

	log.query(options, function(err, results)
	{
		res.set("Cache-Control", "no-cache, no-store, must-revalidate");
		res.set("Pragma", "no-cache");
		res.set("Expires", 0);
		res.render('admin',
		{
			'logs': results.redis,
			'layout': layout,
			'title': 'Administration',
			'setting': Setting
		});
	});
}