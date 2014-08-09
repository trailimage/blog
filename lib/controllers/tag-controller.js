var format = require('../format.js');
var setting = require('../settings.js');
var library = require('../models/library.js');
var log = require('winston');

/** @type {String} */
exports.key = 'tag-menu';

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
	showTag(res, new TagInfo('when', (new Date()).getFullYear().toString()), setting.title);
};

exports.menu = function(req, res)
{
	res.fromCache(exports.key, function(render) { render('tag-menu', { library: library, layout: 'layouts/script' }); });
};

/**
 * @param res Response
 * @param {TagInfo} info
 * @param {String} [title]
 */
function showTag(res, info, title)
{
	var tag = info.tag;

	if (tag != null)
	{
		tag.loadPhotos(function()
		{
			var count = tag.posts.length;
			var sayCount = format.sayNumber(count) + ' Adventure' + ((count > 1) ? 's' : '');
			var view = 'post-tag';
			var options = {
				'posts': tag.posts,
				'title': (title == undefined) ? (tag.title + ': ' + sayCount) : title,
				'tagName': tag.title,
				'tagCount': sayCount
			};
			res.fromCache(info.slug, function(render) { render(view, options); });
		});
	}
	else
	{
		res.notFound();
	}
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

		if (parent != null)
		{
			this.tag = parent.withName(t);
			this.slug = parent.slug + '/' + t;
		}
	}
}