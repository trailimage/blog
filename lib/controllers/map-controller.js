'use strict';

var setting = require('../settings.js');
var format = require('../format.js');
var Enum = require('../enum.js');
var map = require('../models/map.js');
var library = require('../models/library.js');
var log = require('../log.js');

exports.view = (req, res) => {
	view(library.postWithSlug(req.params.slug), req, res);
};

exports.seriesView = (req, res) => {
	view(library.postWithSlug(req.params.groupSlug, req.params.partSlug), req, res);
};

function view(post, req, res) {
	if (post != null) {
		let slug = post.isPartial ? post.seriesSlug : post.slug;

		res.render('map', {
			'layout': 'layouts/empty',
			'title': 'Map',
			'post': post,
			'slug': slug,
			'photoID': req.params.photoID || 0,
			'setting': setting
		});
	} else {
		res.notFound();
	}
}

exports.json = (req, res) => { sendJSON(res, req.params.slug) };

/**
 *
 * @param res
 * @param {String} slug
 * @param {Boolean} [autoCreate] Whether to create GPX from photos if none is cached
 */
function sendJSON(res, slug, autoCreate) {
	if (autoCreate === undefined) { autoCreate = true; }

	map.loadGPX(slug, item => {
		if (item) {
			res.sendCompressed('application/json', new Buffer(item.buffer, 'hex'), item.eTag, false);
		} else if (autoCreate) {
			let post = library.postWithSlug(slug);

			if (post) {
				map.makeGPX(post, success => {
					if (success) { sendJSON(res, slug, false); } else { notFound(res); }
				});
			} else { notFound(res); }
		} else { notFound(res); }
	});
}

function notFound(res) {
	res.status(Enum.httpStatus.notFound);
	res.send({ error: 'Not found' });
}