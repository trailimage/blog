'use strict';

const lib = require('../');

/**
 * Default route action
 */
exports.view = (req, res) => {
	let term = req.query['q'];

	if (term !== undefined) {
		res.render(lib.template.page.search, {
			title: 'Search for “' + req.query['q'] + '”',
			config: lib.config
		});
	} else {
		res.notFound();
	}
};
