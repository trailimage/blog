'use strict';

const config = require('../config.js');
const app = require('../index.js');
const Enum = app.enum;
const is = app.is;
const template = app.template;
const db = app.provider;
const library = require('../models/library.js').current;

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

exports.providerID = (req, res) => {
	let postID = req.params['postID'];
	let post = library.postWithID(postID);

	if (post !== null) {
		res.redirect(Enum.httpStatus.permanentRedirect, '/' + post.slug);
	} else {
		res.notFound();
	}
};

//- Redirects -----------------------------------------------------------------

/**
 * Redirect to blog as configured
 */
exports.blog = (req, res) => {
	if (is.value(config.blog) && is.value(config.blog.redirects)) {
		let slug = req.params['slug'].remove(/\.html?$/);
		let blogPosts = config.blog.redirects;

		if (is.defined(blogPosts, slug)) {
			// redirect is configured
			res.redirect(Enum.httpStatus.permanentRedirect, '/' + blogPosts[slug]);
		} else {
			// send to old blog
			let url = `http://${config.blog.domain}/${req.params['year']}/${req.params['month']}/${req.params['slug']}`;
			db.log.warnIcon(Enum.icon.newWindow, 'Sending %s request to %s', slug, url);
			res.redirect(Enum.httpStatus.temporaryRedirect, url);
		}
	} else {
		// no blog mapping configured
		res.notFound();
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
 * @param res
 * @param {String} slug
 * @param {String} [pageTemplate]
 */
function showPost(res, slug, pageTemplate) {
	res.sendView(slug, render => {
		/** @type {Post} */
		let p = library.postWithSlug(slug);

		if (p === null) { res.notFound(); return; }

		db.photo.loadPost(p, post => {
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