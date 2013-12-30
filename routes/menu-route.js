/** @type {singleton} */
var Output = require('../output.js');
/** @type {Metadata} */
var Metadata = require('../metadata/metadata.js');
/** @see https://npmjs.org/package/uglify-js */
var Uglify = require('uglify-js');
var log = require('winston');
/** @type {String} */
var key = 'menu';

/**
 * Default route action
 */
exports.view = function(req, res)
{
	var reply = Output.current.responder(key, res, 'application/javascript');

	res.setHeader('Vary', 'Accept-Encoding');

	reply.send(function(sent)
	{
		if (sent) { return; }

		reply.render('menu-script', { 'metadata': Metadata.current, 'layout': null }, function(text)
		{
			return Uglify.minify(text, {fromString: true}).code;
		});
	});
};

exports.clear = function(req, res)
{
	Metadata.refresh(function()
	{
		Output.current.remove(key, function() { res.redirect('/'); });
	});
};