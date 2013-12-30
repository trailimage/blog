/** @type {Logger} */
var log = require('winston');
var Enum = require('../enum.js');
var Setting = require('../settings.js');

/**
 * Default route action
 */
exports.view = function(req, res)
{
	log.warn('%s is viewing logs', req.connection.remoteAddress);

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
		res.render('logs', { 'logs': results.redis, 'setting': Setting, 'layout': null });
	});
};

exports.clear = function(req, res)
{
	res.redirect('/logs/view');
};