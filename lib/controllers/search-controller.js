'use strict';

const template = require('../template.js');

/**
 * Default route action
 */
exports.view = (req, res) => {
	let term = req.query['q'];

	if (term !== undefined) {
		res.render(template.page.search, {
			title: 'Search for “' + req.query['q'] + '”',
			config: require('../config.js')
		});
	} else {
		res.notFound();
	}
};
