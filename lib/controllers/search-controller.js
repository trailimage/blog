'use strict';

const TI = require('../');

/**
 * Default route action
 */
exports.view = (req, res) => {
	let term = req.query['q'];

	if (term !== undefined) {
		res.render(TI.template.page.search, {
			title: 'Search for “' + req.query['q'] + '”',
			config: TI.config
		});
	} else {
		res.notFound();
	}
};
