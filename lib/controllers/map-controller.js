'use strict';

const config = require('../config.js');
const db = config.provider;
const template = require('../template.js');
const format = require('../format.js');
const library = require('../models/library.js').current;
const Enum = require('../enum.js');

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
	if (post !== null) {
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

/**
 * Download GPX
 * @param req
 * @param res
 */
exports.download = (req, res) => {
	let post = (config.map.allowDownload) ? library.postWithSlug(req.params['slug']) : null;

	if (post !== null) {
		db.file.loadGPX(post, res);
	} else {
		res.notFound();
	}
};

/**
 * Load compressed GeoJSON as zipped byte array in CacheItem
 * @param req
 * @param res
 */
exports.json = (req, res) => {
	db.file.loadMap(req.params['slug'], item => {
		if (item != null) {
			res.sendCompressed(Enum.mimeType.json, item, false);
		} else {
			res.notFound();
		}
	});
};