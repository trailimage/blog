var format = require('../format.js');
var setting = require('../settings.js');
var library = require('../models/library.js');
var log = require('winston');

exports.view = function(req, res)
{
	var info = new TagInfo(req);
	var tag = info.tag;
	//render(info.tag, info.slug, res);

	tag.loadPhotos(function()
	{
		var count = tag.posts.length;
		var view = 'post-tag';
		var options = {
			'posts': tag.posts,
			'title': format.string('{2}: {0} Post{1}',
				format.sayNumber(count),
				((count > 1) ? 's' : ''),
				tag.title),
			'setting': setting
		};
		res.fromCache(info.slug, function(cacher) { cacher(view, options); });
	});
};

function TagInfo(req)
{
	var c = req.params.category;
	var t = req.params.tag;
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

