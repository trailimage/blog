var format = require('../format.js');
var setting = require('../settings.js');
var library = require('../models/library.js');
var log = require('winston');

exports.view = function(req, res)
{
	showTag(res, new TagInfo(req.params.category, req.params.tag));
};

/**
 * "Home" page shows latest "When" tag
 * @param req
 * @param res
 */
exports.home = function(req, res)
{
	showTag(res, new TagInfo('When', (new Date()).getFullYear().toString()));
};

exports.menu = function(req, res)
{
	res.fromCache('tag-menu', function(render) { render('tag-menu', { library: library, layout: 'layouts/script' }); });
};

/**
 * @param res Response
 * @param {TagInfo} info
 */
function showTag(res, info)
{
	var tag = info.tag;

	tag.loadPhotos(function()
	{
		var count = tag.posts.length;
		var sayCount = format.sayNumber(count) + ' Adventure' + ((count > 1) ? 's' : '');
		var view = 'post-tag';
		var options = {
			'posts': tag.posts,
			'title': tag.title + ': ' + sayCount,
			'tagName': tag.title,
			'tagCount': sayCount,
			'layout': 'layouts/simple'
		};
		res.fromCache(info.slug, function(render) { render(view, options); });
	});
}

/**
 *
 * @param {string} c Category (Who, What, When, Where)
 * @param {string} t Tag
 * @constructor
 */
function TagInfo(c, t)
{
	/** @type {Tag} */
	var parent = null;
	/** @type {Tag} */
	this.tag = null;
	this.slug = null;

	if (c != 'tag')
	{
		this.slug = c + '/' + t;
		parent = library.tags[format.capitalize(c)];
		this.tag = (parent != null) ? parent.withName(t) : null;
	}
	else
	{
		parent = library.tagWithChild(t);
		this.tag = parent.withName(t);
		this.slug = parent.slug + '/' + t;
	}
}