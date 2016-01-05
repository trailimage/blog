'use strict';

const Blog = require('../');

/**
 * Default route action
 */
exports.view = (req, res) => {
	res.sendView(Blog.template.page.sitemap, Blog.mimeType.xml, render => {
		const library = Blog.Library.current;

		render(Blog.template.page.sitemap, {
			posts: library.posts,
			tags: library.tagSlugs(),
			photoTags: library.photoTags,
			layout: null
		});
	});
};