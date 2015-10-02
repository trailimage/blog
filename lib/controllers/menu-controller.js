'use strict';

const setting = require('../settings.js');
/** @see https://npmjs.org/package/uglify-js */
const uglify = require('uglify-js');

/** @type {String} */
exports.key = 'menu';

/**
 * Default route action
 */
exports.view = (req, res) => {
	const library = require('../models/library.js');

	res.setHeader('Vary', 'Accept-Encoding');
	res.sendView(exports.key, 'application/javascript', render => {
		render(
			'menu-script',
			{'library': library, 'layout': null },
			text => uglify.minify(text, {fromString: true}).code);
	});
};