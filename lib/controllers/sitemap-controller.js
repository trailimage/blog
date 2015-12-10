'use strict';

const TI = require('../');

/**
 * Default route action
 */
exports.view = (req, res) => {
	res.sendView(TI.template.page.sitemap, 'application/xml', render => {
		const library = TI.Library.current;

		render(TI.template.page.sitemap, {
			posts: library.posts,
			tags: library.tagSlugs(),
			photoTags: library.photoTags,
			layout: null
		});
	});
};