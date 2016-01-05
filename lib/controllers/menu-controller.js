'use strict';

const Blog = require('../');
const template = Blog.template;
/** @see https://npmjs.org/package/uglify-js */
const uglify = require('uglify-js');
const library = Blog.Library.current;

/**
 * Default route action
 */
exports.data = (req, res) => {
	let slug = template.page.postMenuData;
	res.setHeader('Vary', 'Accept-Encoding');
	res.sendView(slug, 'application/javascript', render => {
		render(
			slug,
			{ library: library, layout: template.layout.none },
			// post-process rendered output
			text => uglify.minify(text, {fromString: true}).code);
	});
};

/**
 * Menu for mobile devices
 */
exports.mobile = (req, res) => {
	let slug = template.page.mobileMenuData;
	res.sendView(slug, render => {
		render(slug, { library: library, layout: template.layout.none });
	});
};