'use strict';

const Blog = require('../');

/**
 * Default route action
 */
exports.view = (req, res) => {
	let term = req.query['q'];

	if (term !== undefined) {
		res.render(Blog.template.page.search, {
			title: 'Search for “' + req.query['q'] + '”',
			config: Blog.config
		});
	} else {
		res.notFound();
	}
};
