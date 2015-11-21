'use strict';

const template = require('../template.js');

/**
 * Default route action
 */
exports.view = (req, res) => {
	res.sendView(template.page.sitemap, 'application/xml', render => {
		const library = require('../models/library.js').current;

		render(template.page.sitemap, {
			posts: library.posts,
			tags: library.tagSlugs(),
			photoTags: library.photoTags,
			layout: null
		});
	});
};