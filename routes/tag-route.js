var Format = require('../format.js');
var Setting = require('../settings.js');
/** @type {singleton} */
var Output = require('../adapters/output.js');
/** @type {Library} */
var Metadata = require('../models/library.js');
var log = require('winston');

/** @type {Boolean} */
var prepared = false;
/** @type {Library} */
var metadata = null;
/** @type {Output} */
var output = null;

function prepare()
{
	if (!prepared)
	{
		metadata = Metadata.current;
		output = Output.current;
	}
}

exports.view = function(req, res)
{
	prepare();
	var tag = new Tag(req);
	tryRender(tag.collection, tag.slug, res);
};

exports.clear = function(req, res)
{
	prepare();

	var tag = new Tag(req);
	log.warn('Clearing tag %s from cache', tag.slug);
	output.remove(tag.slug, function(done) { refreshSchema(res, '/tag/' + req.params.tag); });
};

exports.clearAll = function(req, res)
{
	prepare();
	log.warn('Clearning all tags from cache');
	output.remove(metadata.postTagSlugs(), function(done) { refreshSchema(res); });
};

function Tag(req)
{
	var c = req.params.category;
	var t = req.params.tag;
	/** @type {Tag} */
	var parent = null;
	/** @type {Tag} */
	this.collection = null;
	this.slug = null;

	if (c != 'tag')
	{
		this.slug = c + '/' + t;
		parent = metadata.tags[Format.capitalize(c)];
		this.collection = (parent != null) ? parent.withName(t) : null;
	}
	else
	{
		parent = metadata.tagWithChild(t);
		this.collection = parent.withName(t);
		this.slug = parent.slug + '/' + t;
	}
}

/**
 * Must reload schema to regenerate tag page
 * @param res
 * @param {String} [path]
 */
function refreshSchema(res, path)
{
	Metadata.refresh(function()
	{
		if (path === undefined) { path = '/'; }
		res.redirect(path);
	});
}

/**
 * @param {Tag} collection
 * @param {String} [slug]
 * @param [res]
 */
function tryRender(collection, slug, res)
{
	var reply = output.responder(slug, res, 'text/html');

	if (!metadata.postInfoLoaded)
	{
		// don't cache until all item info is loaded since search page shows lazy loaded thumbs
		render(collection, reply, slug, res);
	}
	else
	{
		reply.send(function(sent)
		{
			if (!sent) { render(collection, reply, slug, res); }
		});
	}
}

/**
 * @param {Tag} collection
 * @param {Responder} reply
 * @param {String} [slug]
 * @param [res]
 */
function render(collection, reply, slug, res)
{
	if (collection != null)
	{
		var count = collection.posts.length;

		reply.render('post-tag',
		{
			'sets': collection.posts,
			'title': Format.string('{0} post{1} tagged “{2}”',
				Format.sayNumber(count),
				((count > 1) ? 's' : ''),
				collection.title),
			'setting': Setting
		});
	}
	else
	{
		Output.replyNotFound(res, slug + ' was not found');
	}
}