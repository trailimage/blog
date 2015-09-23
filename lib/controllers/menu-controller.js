'use strict';

let setting = require('../settings.js');
/** @see https://npmjs.org/package/uglify-js */
let uglify = require('uglify-js');

/** @type {String} */
exports.key = 'menu';

/**
 * Default route action
 */
exports.view = (req, res) => {
	let library = require('../models/library.js');

	res.setHeader('Vary', 'Accept-Encoding');
	res.sendView(exports.key, 'application/javascript', render => {
		render(
			'menu-script',
			{'library': library, 'layout': null },
			text => uglify.minify(text, {fromString: true}).code);
	});
};