'use strict';

const lib = require('../');

/**
 * Default route action
 */
exports.view = (req, res) => {
	res.sendView(lib.template.page.sitemap, 'application/xml', render => {
		const library = lib.Library.current;

		render(lib.template.page.sitemap, {
			posts: library.posts,
			tags: library.tagSlugs(),
			photoTags: library.photoTags,
			layout: null
		});
	});
};