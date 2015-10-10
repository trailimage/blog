'use strict';

const template = require('../template.js');
const setting = require('../settings.js');
/** @see https://npmjs.org/package/uglify-js */
const uglify = require('uglify-js');
const library = require('../models/library.js');

/** @type {String} */
exports.key = 'menu';

/**
 * Default route action
 */
exports.data = (req, res) => {
	res.setHeader('Vary', 'Accept-Encoding');
	res.sendView(exports.key + ':script', 'application/javascript', render => {
		render(
			template.page.postMenuScript,
			{ library: library, layout: template.layout.none },
			text => uglify.minify(text, {fromString: true}).code);
	});
};

/**
 * Menu for mobile devices
 */
exports.mobile = (req, res) => {
	res.sendView(exports.key + ':mobile', render => {
		render(template.page.mobileMenu, { library: library, layout: template.layout.script });
	});
};