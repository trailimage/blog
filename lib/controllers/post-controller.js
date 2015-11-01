'use strict';

const config = require('../config.js');
const is = require('../is.js');
const template = require('../template.js');
const Enum = require('../enum.js');
const library = require('../models/library.js').current;
const blogUrl = require('../models/post.js').blogUrl;
const log = config.provider.log;
const blogDomain = 'trailimage.blogspot.com';

/**
 * Default route action
 */
exports.view = (req, res) => { showPost(res, req.params.slug); };

/**
 * "Home" page shows latest post
 * @param req
 * @param res
 */
exports.home = (req, res) => { showPost(res, library.posts[0].slug); };

exports.flickrID = (req, res) => {
	let postID = req.params['postID'];
	let post = library.postWithID(postID);

	if (post !== null) {
		res.redirect(Enum.httpStatus.permanentRedirect, '/' + post.slug);
	} else {
		res.notFound();
	}
};

/**
 * Show featured set at Flickr
 * @param req
 * @param res
 */
exports.featured = (req, res) => {
	res.redirect(Enum.httpStatus.permanentRedirect, config.flickr.url.photoSet + config.flickr.photoSet.featured + '/');
};

//- Redirects -----------------------------------------------------------------

/**
 * Redirect to posts that haven't been transitioned from the old blog
 */
exports.blog = (req, res) => {
	let slug = req.params['slug'].remove(/\.html?$/);

	if (slug in blogUrl && !is.empty(blogUrl[slug])) {
		res.redirect(Enum.httpStatus.permanentRedirect, '/' + blogUrl[slug]);
	} else {
		// send to old blog
		let url = `http://${blogDomain}/${req.params['year']}/${req.params['month']}/${req.params['slug']}`;
		log.warn('Sending %s request to %s', slug, url);
		res.redirect(Enum.httpStatus.temporaryRedirect, url);
	}
};

/**
 * Display post that's part of a series
 * @param req
 * @param res
 */
exports.seriesPost = (req, res) => { showPost(res, seriesPostSlug(req)); };

/**
 * Slug for single post within a series
 * @returns {string}
 */
function seriesPostSlug(req) { return req.params['groupSlug'] + '/' + req.params['partSlug']; }

/**
 * Redirect routes that have changed
 * @param app
 */
exports.addFixes = app => {
	var fixes = {
		'/brother-rider-2013-a-night-in-pierce': '/brother-ride-2013',
		'/backroads-to-college': '/panhandle-past-and-future',
		'/owyhee-snow-and-sands-uplands': '/owyhee-snow-and-sand'
	};

	for (let i in fixes) {
		app.get(i, (req, res) => { res.redirect(Enum.httpStatus.permanentRedirect, fixes[i]); });
	}
};

/**
 * @param res
 * @param {String} slug
 * @param {String} [pageTemplate]
 */
function showPost(res, slug, pageTemplate) {
	res.sendView(slug, render => {
		/** @type {Post} */
		let p = library.postWithSlug(slug);
		let db = require('../db.js');

		if (p === null) { res.notFound(); return; }

		db.updatePostPhotos(p, post => {
			if (pageTemplate === undefined) { pageTemplate = template.page.post; }

			render(pageTemplate, {
				post: post,
				title: post.title,
				description: post.longDescription,
				slug: slug,
				keywords: post.photoTagList,
				layout: template.layout.none
			});
		});
	});
}