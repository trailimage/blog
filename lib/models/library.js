"use strict";

var _ = require('lodash/collection');
var format = require('./../format.js');
var Enum = require('./../enum.js');
var setting = require('./../settings.js');
var Post = require('./post.js');
/** @type {PostTag} */
var PostTag = require('./post-tag.js');
var PhotoTag = require('./photo-tag.js');
var log = require('winston');
/** @type {Object} */
var queue = {};
const schema = 'model';

exports.key = 'library';

/**
 * Root tags
 * @type {Object.<PostTag>}
 */
exports.tags = {};

/**
 * Flat reference to all posts for simplified lookup
 * @type {Post[]}
 */
exports.posts = [];

/**
 * Hash of photo tags in hash[key] = name format
 * @type {Object.<String>}
 **/
exports.photoTags = {};

/**
 * Whether post information is loaded
 * @returns {boolean}
 */
exports.postInfoLoaded = false;

/**
 * @returns {String[]}
 */
exports.postSlugs = function() { return _.map(exports.posts, function(p) { return p.slug; }); };

/**
 * @param {String[]} [names] List of tag names or all if no list given
 * @returns {String[]}
 */
exports.tagSlugs = function(names)
{
	/** @type {String[]} */
	var slugs = [];
	/** @type {PostTag} */
	var child;

	if (names && names.length > 0)
	{
		_.each(names, function(n)
		{
			_.each(exports.tags, function(parent)
			{
				child = parent.child(n);
				if (child != null) { slugs.push(parent.slug + '/' + child.slug); }
			});
		});
	}
	else
	{
		_.each(exports.tags, function(parent)
		{
			_.each(parent.tags, function(t)
			{
				slugs.push(parent.slug + '/' + t.slug);
			});
		});
	}
	return slugs;
};

/**
 * @param {String} name
 * @return {PostTag}
 */
exports.tagWithChild = function(name)
{
	return _.find(exports.tags, function(t)
	{
		return t.hasOwnProperty('hasChild') && t.hasChild(name);
	});
};

/**
 * @param {String} id Set ID
 * @returns {Post}
 */
exports.postWithID = function(id) { return _.find(exports.posts, {'id': id }); };

/**
 * @param {String} slug
 * @param {String} [partSlug = null]
 * @returns {Post}
 */
exports.postWithSlug = function(slug, partSlug)
{
	if (partSlug) { slug += "/" + partSlug; }
	return _.find(exports.posts, function(p) { return p.isMatch(slug); });
};

// - Private methods ----------------------------------------------------------

/**
 * Add Flickr collection to the tree
 * @param {Flickr.Collection} api
 * @param {Boolean} [root = false]
 * @return {PostTag}
 */
function addTag(api, root)
{
	var t = new PostTag(api),
		/** @type {Post} */
		p = null,
		/** @type {int} */
		i = 0;

	if (root) { exports.tags[t.title] = t; }

	if (api.set)
	{
		for (i = 0; i < api.set.length; i++)
		{
			p = exports.postWithID(api.set[i].id);

			// create item object if it isn't part of an already added group
			if (p == null) { p = Post.fromFlickr(api.set[i]); }

			p.addTag(t.title);
			t.posts.push(p);
			addPost(p);
		}
	}

	if (api.collection)
	{
		for (i = 0; i < api.collection.length; i++)
		{
			t.tags.push(addTag(api.collection[i]));
		}
	}

	if (root)
	{
		addPost(Post.fromFlickr({'id': setting.flickr.poemSet, 'title': 'Ruminations'}, false));
	}

	return t;
}

/**
 * @param {Post} p
 */
function addPost(p)
{
	if (_.any(exports.posts, {'id': p.id })) { return; }

	exports.posts.push(p);

	if (p.chronological && exports.posts.length > 1)
	{
		/** @type {Post} */
		let next = exports.posts[exports.posts.length - 2];

		if (next.chronological)
		{
			p.next = next;
			next.previous = p;
		}
	}
}

// - Initialization -----------------------------------------------------------

exports.load = function(callback)
{
	if (setting.cacheOutput)
	{
		let db = require('../adapters/hash.js');

		db.at(schema).getAll(exports.key, function(hash)
		{
			if (hash != null)
			{
				try
				{
					parseTree(JSON.parse(hash.tree));

					/** @type {Post} */
					let post = null;
					/** @type {String} */
					let value = null;

					for (let i = 0; i < exports.posts.length; i++)
					{
						post = exports.posts[i];
						value = hash[post.id];

						if (format.isEmpty(value) || value == 'undefined')
						{
							log.error('Encountered invalid cached content for post %s: must reload', post.id);
							exports.reload(callback);
							return;
						}
						else
						{
							post.addInfo(JSON.parse(value));
						}
					}
				}
				catch (error)
				{
					log.error('Unable to parse cached library (%s): must reload', error.toString());
					exports.reload(callback);
					return;
				}

				exports.postInfoLoaded = true;

				log.info('Loaded %d photo posts from cache with details', exports.posts.length);
				PhotoTag.load(callback);
			}
			else
			{
				loadFromFlickr(function() { PhotoTag.load(callback); });
			}
		});
	}
	else
	{
		loadFromFlickr(function() { PhotoTag.load(callback); });
	}

};

/**
 * Reload library from Flickr
 * @param {function(string[])} [callback]
 */
exports.reload = function(callback)
{
	// record posts so they can be compared to the new list
	var oldPosts = _.map(exports.posts, 'slug');
	// track slugs that need to be refreshed if cached
	var slugs = [];

	exports.postInfoLoaded = false;
	exports.posts = [];
	exports.tags = {};
	exports.photoTags = {};

	loadFromFlickr(function()
	{
		_.each(exports.posts, function(p)
		{
			if (_.contains(oldPosts, p.slug))     // new post
			{
				log.info('Found new post "%s"', p.title)
				slugs = slugs.concat(exports.tagSlugs(p.tags));               // all tags applied to the new post
				if (p.next != null) { slugs.push(p.next.slug); }
				if (p.previous != null) { slugs.push(p.previous.slug); }
			}
		});
		PhotoTag.load(function() { callback(slugs);	});
	});
};

/**
 * Unload particular posts
 * @param {String[]} slugs
 */
exports.unload = function(slugs)
{
	_.each(slugs, function(s)
	{
		let p = exports.postWithSlug(s);
		if (p != null) { p.removeDetails(); }
	});
};

/**
 * @param {function} [callback]
 */
function loadFromFlickr(callback)
{
	var flickr = require('../adapters/flickr.js');

	flickr.getCollection(function(tree)
	{
		if (tree == null)
		{
			log.warn('Retrying in %d seconds', (setting.retryDelay / Enum.time.second));
			setTimeout(function() { loadFromFlickr(callback); }, setting.retryDelay);
		}
		else
		{
			parseTree(tree);
			queue['tree'] = JSON.stringify(tree);
			log.info('Loaded %d photo posts from Flickr: beginning detail retrieval', exports.posts.length);
			if (callback) { callback(); }
			loadPostInfo();
		}
	});
}

/**
 * @param {Flickr.Tree} api
 */
function parseTree(api)
{
	_.each(api.collection, function(t) { addTag(t, true); });
	correlatePosts();
}

/**
 * Asynchronously load additional post information
 */
function loadPostInfo()
{
	var flickr = require('../adapters/flickr.js');
	var pending = exports.posts.length;

	for (let i = 0; i < exports.posts.length; i++)
	{
		/**
		 * @param {Post} post
		 */
		(function(post)
		{
			flickr.getSetInfo(post.id, function(info)
			{
				//log.info('Loaded set detail %d/%d "%s"', index + 1, total, set.name());
				if (info)
				{
					queue[post.id] = JSON.stringify(info);
					post.addInfo(info);
				}
				else
				{
					log.warn('Removing post %s from library', post.id);
					delete queue[post.id];
				}
				if (--pending <= 0)
				{
					let db = require('../adapters/hash.js');
					exports.postInfoLoaded = true;
					db.at(schema).addAll(exports.key, queue);
					log.info('Finished loading photo set details');
				}
			});
		})(exports.posts[i]);
	}
}

/**
* Match posts that are part of a series
*/
function correlatePosts()
{
	/** @type {Post} */
	var p = exports.posts[0];
	/** @type {Post[]} */
	var parts = [];

	while (p != null && p.previous != null)
	{
		if (p.subTitle != null)
		{
			parts.push(p);

			while (p.previous != null && p.previous.title == p.title)
			{
				p = p.previous;
				parts.unshift(p);
			}

			if (parts.length > 1)
			{
				parts[0].makeSeriesStart();

				for (let i = 0; i < parts.length; i++)
				{
					parts[i].part = i + 1;
					parts[i].totalParts = parts.length;
					parts[i].isPartial = true;

					if (i > 0) { parts[i].previousIsPart = true; }
					if (i < parts.length - 1) { parts[i].nextIsPart = true; }
				}
			}
			else
			{
				p.ungroup();
			}
			parts = [];
		}
		p = p.previous;
	}
}