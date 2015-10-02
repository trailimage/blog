'use strict';

/**
 * Default route action
 */
exports.view = (req, res) => {
	let term = req.query['q'];

	if (term !== undefined) {
		res.render('search', {
			'title': 'Search for “' + req.query['q'] + '”',
			'setting': require('../settings.js')
		});
	} else {
		res.notFound();
	}
};
