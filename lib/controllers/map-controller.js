'use strict';

const setting = require('../settings.js');
const template = require('../template.js');
const format = require('../format.js');
const Enum = require('../enum.js');
const map = require('../models/map.js');
const library = require('../models/library.js');
const log = require('../log.js');

exports.view = (req, res) => {
	view(library.postWithSlug(req.params.slug), req, res);
};

exports.seriesView = (req, res) => {
	view(library.postWithSlug(req.params.groupSlug, req.params.partSlug), req, res);
};

function view(post, req, res) {
	if (post != null) {
		let slug = post.isPartial ? post.seriesSlug : post.slug;

		res.render(template.page.map, {
			layout: template.layout.none,
			title: 'Map',
			post: post,
			slug: slug,
			photoID: req.params.photoID || 0,
			setting: setting
		});
	} else {
		res.notFound();
	}
}

exports.json = (req, res) => { sendJSON(res, req.params.slug); };

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