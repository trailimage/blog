"use strict";

exports.key = 'sitemap';

/**
 * Default route action
 */
exports.view = function(req, res) {
	res.sendView(exports.key, 'application/xml', function(render) {
		let library = require('../models/library.js');

		render('sitemap-xml', {
			'posts': library.posts,
			'tags': library.tagSlugs(),
			'photoTags': library.photoTags,
			'layout': null
		});
	});
};