"use strict";

var setting = require('../settings.js');
/** @see https://npmjs.org/package/uglify-js */
var uglify = require('uglify-js');

/** @type {String} */
exports.key = 'menu';

/**
 * Default route action
 */
exports.view = function(req, res)
{
	var library = require('../models/library.js');

	res.setHeader('Vary', 'Accept-Encoding');
	res.sendView(exports.key, 'application/javascript', function(render)
	{
		render('menu-script', {'library': library, 'layout': null }, function(text)
		{
			return uglify.minify(text, {fromString: true}).code;
		});
	});
};