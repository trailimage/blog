'use strict';

exports.key = 'sitemap';

/**
 * Default route action
 */
exports.view = (req, res) => {
	res.sendView(exports.key, 'application/xml', render => {
		const library = require('../models/library.js').current;

		render('sitemap-xml', {
			posts: library.posts,
			tags: library.tagSlugs(),
			photoTags: library.photoTags,
			layout: null
		});
	});
};