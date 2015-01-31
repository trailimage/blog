'use strict';

var format = require('../format.js');
var setting = require('../settings.js');
var library = require('../models/library.js');
var log = require('winston');
var Tag = require('../models/post-tag.js');

/** @type {String} */
exports.key = 'tag-menu';

exports.view = function(req, res)
{
	showTag(res, new TagInfo(req.params.category, req.params.tag));
};

/**
 * "Home" page shows latest "When" tag that contains posts
 * @param req
 * @param res
 */
exports.home = function(req, res)
{
	let year = (new Date()).getFullYear();
	let when = library.tags['When'];
	let tag = null;
	let count = 0;

	while (count == 0)
	{
		tag = when.withName(year.toString());
		if (tag != null) { count = tag.posts.length; }
		year--;
	}
	showTag(res, new TagInfo('when', tag), setting.title);
};

exports.menu = function(req, res)
{
	res.sendView(exports.key, function(render) { render('tag-menu', { library: library, layout: 'layouts/script' }); });
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
			let count = tag.posts.length;
			let sayCount = format.sayNumber(count) + ' Adventure' + ((count > 1) ? 's' : '');
			let view = 'post-tag';
			let options = {
				'posts': tag.posts,
				'title': (title == undefined) ? (tag.title + ': ' + sayCount) : title,
				'tagName': tag.title,
				'tagCount': sayCount
			};
			res.sendView(info.slug, function(render) { render(view, options); });
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
 * @param {string|Tag} [t] Tag
 * @constructor
 */
function TagInfo(c, t)
{
	/** @type {Tag} */
	var parent = null;
	/** @type {Tag} */
	this.tag = null;
	this.slug = null;

	if (t instanceof Tag)
	{
		// use given tag object
		this.tag = t;
		this.slug = c + '/' + t.slug;
	}
	else if (c != 'tag')
	{
		// get named parent and child
		this.slug = c + '/' + t;
		parent = library.tags[format.capitalize(c)];
		this.tag = (parent != null) ? parent.withName(t) : null;
	}
	else
	{
		// search for parent having named child
		parent = library.tagWithChild(t);

		if (parent != null)
		{
			this.tag = parent.withName(t);
			this.slug = parent.slug + '/' + t;
		}
	}
}