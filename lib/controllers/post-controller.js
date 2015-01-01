var setting = require('../settings.js');
var format = require('../format.js');
var Enum = require('../enum.js');
var library = require('../models/library.js');
var Post = require('../models/post.js');
var log = require('winston');

/**
 * Default route action
 */
exports.view = function(req, res) { showPost(res, req.params.slug); };

/**
 * "Home" page shows latest post
 * @param req
 * @param res
 */
exports.home = function(req, res) {	showPost(res, library.posts[0].slug); };

exports.flickrID = function(req, res)
{
	var postID = req.params['postID'];
	var post = library.postWithID(postID);

	if (post != null)
	{
		res.redirect(Enum.httpStatus.permanentRedirect, '/' + post.slug);
	}
	else
	{
		res.notFound();
	}
};

/**
 * Show featured set at Flickr
 * @param req
 * @param res
 */
exports.featured = function(req, res)
{
	res.redirect(Enum.httpStatus.permanentRedirect, 'http://www.flickr.com/photos/trailimage/sets/72157631638576162/');
};

//- Redirects -----------------------------------------------------------------

/**
 * Redirect to posts that haven't been transitioned from the old blog
 */
exports.blog = function(req, res)
{
	var slug = req.params.slug.replace(/\.html?$/, '');

	if (slug in Post.blogUrl && !format.isEmpty(Post.blogUrl[slug]))
	{
		res.redirect(Enum.httpStatus.permanentRedirect, '/' + Post.blogUrl[slug]);
	}
	else
	{
		// send to old blog
		var url = 'http://trailimage.blogspot.com/' + req.params['year'] + '/' + req.params['month'] + '/' + req.params['slug'];
		log.warn('Sending %s request to %s', slug, url);
		res.redirect(Enum.httpStatus.temporaryRedirect, url);
	}
};

/**
 * Display post that's part of a series
 * @param req
 * @param res
 */
exports.seriesPost = function(req, res) { showPost(res, seriesPostSlug(req)); };

/**
 * Slug for single post within a series
 * @returns {string}
 */
function seriesPostSlug(req) { return req.params['groupSlug'] + '/' + req.params['partSlug']; }

/**
 * Redirect routes that have changed
 * @param app
 */
exports.addFixes = function(app)
{
	var fixes =
	{
		'/brother-rider-2013-a-night-in-pierce': '/brother-ride-2013',
		'/backroads-to-college': '/panhandle-past-and-future',
		'/owyhee-snow-and-sands-uplands': '/owyhee-snow-and-sand'
	};

	for (var i in fixes)
	{
		app.get(i, function(req, res) { res.redirect(Enum.httpStatus.permanentRedirect, fixes[i]); });
	}
};

/**
 *
 * @param res
 * @param {String} slug
 * @param {String} [template]
 */
function showPost(res, slug, template)
{
	res.sendView(slug, function(render)
	{
		var p = library.postWithSlug(slug);

		if (p == null) { res.notFound(); return; }

		p.getPhotos(function()
		{
			if (template === undefined) { template = 'post'; }

			render(template,
			{
				'post': p,
				'title': p.title,
				'description': p.longDescription,
				'slug': slug,
				'keywords': p.photoTagList,
				'layout': setting.layout.post
			});
		});
	});
}