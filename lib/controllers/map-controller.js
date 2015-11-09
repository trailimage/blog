'use strict';

const config = require('../config.js');
const template = require('../template.js');
const format = require('../format.js');
const Enum = require('../enum.js');
const tracks = config.provider.tracks;
const library = require('../models/library.js').current;

exports.view = (req, res) => {
	view(library.postWithSlug(req.params['slug']), req, res);
};

exports.seriesView = (req, res) => {
	view(library.postWithSlug(req.params['groupSlug'], req.params['partSlug']), req, res);
};

/**
 * First map screen loads then makes AJAX call to fetch data
 * @param post
 * @param req
 * @param res
 */
function view(post, req, res) {
	if (post != null) {
		let slug = post.isPartial ? post.seriesSlug : post.slug;

		res.render(template.page.map, {
			layout: template.layout.none,
			title: 'Map',
			post: post,
			slug: slug,
			photoID: req.params.photoID || 0,
			config: config
		});
	} else {
		res.notFound();
	}
}

//exports.json = (req, res) => { sendJSON(res, req.params.slug); };

exports.json = (req, res) => {
	config.provider.track.loadMap(slug, item => {
		if (item != null) {
			res.sendCompressed('application/json', item, false);
		} else {
			res.notFound();
		}
	});
};