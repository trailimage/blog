"use strict";

var Format = require('./../format.js');
var Enum = require('./../enum.js');
var Setting = require('./../settings.js');
/** @type {Post} */
var Post = require('./post.js');
/** @type {Tag} */
var Tag = require('./postTag.js');
var PhotoTag = require('./photoTag.js');
var log = require('winston');
/** @type {Object} */
var queue = {};

exports.key = 'library';
/**
 * Root tags
 * @type {Object.<Tag>}
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
exports.postSlugs = function()
{
	var list = [];

	for (var i = 0; i < exports.posts.length; i++)
	{
		list.push(exports.posts[i].slug);
	}

	return list;
};

/**
 * @param {String[]} [names] List of tag names or all if no list given
 * @returns {String[]}
 */
exports.tagSlugs = function(names)
{
	/** @type {String[]} */
	var slugs = [];
	/** @type {Tag} */
	var parent;
	/** @type {Tag} */
	var child;
	/** @type {String} tag title */
	var title = "";
	var i = 0;

	if (names && names.length > 0)
	{
		for (i = 0; i < names.length; i++)
		{
			for (title in exports.tags)
			{
				parent = exports.tags[title];
				child = parent.withName(names[i]);
				if (child != null) { slugs.push(parent.slug + '/' + child.slug); }
			}
		}
	}
	else
	{
		for (title in exports.tags)
		{
			parent = exports.tags[title];

			for (i = 0; i < parent.tags.length; i++)
			{
				slugs.push(parent.slug + '/' + parent.tags[i].slug);
			}

		}
	}
	return slugs;
};

/**
 * @param {String} name
 * @return {Tag}
 */
exports.tagWithChild = function(name)
{
	/** @type {Tag} */
	var g = null;

	for (var title in exports.tags)
	{
		g = exports.tags[title];
		if (g.hasOwnProperty('hasChild') && g.hasChild(name)) { return g; }
	}
	return null;
};

/**
 * @param {String} id Set ID
 * @returns {Post}
 */
exports.postWithID = function(id)
{
	for (var i = 0; i < exports.posts.length; i++)
	{
		if (exports.posts[i].id == id) { return exports.posts[i]; }
	}
	return null;
};

/**
 * @param {String} slug
 * @param {String} [partSlug = null]
 * @returns {Post}
 */
exports.postWithSlug = function(slug, partSlug)
{
	if (partSlug) { slug += "/" + partSlug; }

	for (var i = 0; i < exports.posts.length; i++)
	{
		if (exports.posts[i].isMatch(slug)) { return exports.posts[i]; }
	}
	return null;
};

//- Private methods -----------------------------------------------------------

/**
 * Add Flickr collection to the tree
 * @param {Flickr.Collection} api
 * @param {Boolean} [root = false]
 * @return {Tag}
 */
function addTag(api, root)
{
	var t = new Tag(api),
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
			if (p == null) { p = new Post(api.set[i]); }

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
		addPost(new Post({'id': Setting.flickr.featureSet, 'title': 'Featured'}, false));
		addPost(new Post({'id': Setting.flickr.poemSet, 'title': 'Ruminations'}, false));
	}

	return t;
}

/**
 * @param {Post} set
 */
function addPost(set)
{
	for (var i = 0; i < exports.posts.length; i++)
	{
		if (exports.posts[i].id == set.id) { return; }
	}
	exports.posts.push(set);

	if (set.timebound && exports.posts.length > 1)
	{
		/** @type {Post} */
		var next = exports.posts[exports.posts.length - 2];

		if (next.timebound)
		{
			set.next = next;
			next.previous = set;
		}
	}
}

/**
 * Asynchronously load additional information used by the RSS feed and tag pages
 * @param {Number} index
 */
function addPostInfo(index)
{
	var total = exports.posts.length;

	if (index > total - 1)
	{
		exports.postInfoLoaded = true;
		log.info('Finished loading photo set details');
		return;
	}

	/** @type {Post} */
	var p = exports.posts[index];

	flickr.getSetInfo(p.id, function(info)
	{
		//log.info('Loaded set detail %d/%d "%s"', index + 1, total, set.name());
		p.addInfo(info);
		addPostInfo(index + 1);
	});
}

//- Initialization ------------------------------------------------------------

exports.load = function(callback)
{
	var db = require('./../adapters/redis.js');

	db.getAll(exports.key, function(hash)
	{
		if (hash != null)
		{
			try
			{
				loadTree(JSON.parse(hash.tree));

				/** @type {Post} */
				var post = null;
				/** @type {String} */
				var value = null;

				for (var i = 0; i < exports.posts.length; i++)
				{
					post = exports.posts[i];
					value = hash[post.id];

					if (Format.isEmpty(value) || value == 'undefined')
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

			log.info('Loaded %d photo posts from redis with details', exports.posts.length);
			PhotoTag.load(callback);
		}
		else
		{
			loadFromFlickr(function() { PhotoTag.load(callback); });
		}
	});
};

/**
 * Reload library from Flickr
 * @param {function} callback
 */
exports.reload = function(callback)
{
	exports.postInfoLoaded = false;
	loadFromFlickr(function() { PhotoTag.load(callback); });
};

/**
 * @param {function} [callback]
 */
function loadFromFlickr(callback)
{
	var flickr = require('./../adapters/flickr.js');

	flickr.on('error', function(data)
	{
		log.error('Flickr not responding: %j', data);
		log.warn('Retrying in %d seconds', (Setting.retryDelay / Enum.time.second));
		setTimeout(function() { loadFromFlickr(callback); }, Setting.retryDelay);
	});

	flickr.getCollection(function(tree)
	{
		flickr.removeAllListeners('error');
		loadTree(tree);
		queue['tree'] = JSON.stringify(tree);
		log.info('Loaded %d photo posts from Flickr: beginning detail retrieval', exports.posts.length);
		if (callback) { callback(); }
		loadPostInfo(0);
	});
}

/**
 * @param {Flickr.Tree} api
 */
function loadTree(api)
{
	for (var i = 0; i < api.collection.length; i++)
	{
		addTag(api.collection[i], true);
	}
	correlatePosts();
}

/**
 * Asynchronously load additional post information
 * @param {Number} index
 */
function loadPostInfo(index)
{
	var flickr = require('./../adapters/flickr.js');
	var total = exports.posts.length;

	if (index > total - 1)
	{
		var db = require('./../adapters/redis.js');
		exports.postInfoLoaded = true;
		db.addAll(exports.key, queue);
		log.info('Finished loading photo set details');
		return;
	}

	/** @type {Post} */
	var post = exports.posts[index];

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
		loadPostInfo(index + 1);
	});
}

/**
* Match posts that are part of a series
*/
function correlatePosts()
{
	/** @type {Post} */
	var s = exports.posts[0];
	/** @type {Post[]} */
	var parts = [];

	while (s != null && s.previous != null)
	{
		if (s.subTitle != null)
		{
			parts.push(s);

			while (s.previous != null && s.previous.title == s.title)
			{
				s = s.previous;
				parts.unshift(s);
			}

			if (parts.length > 1)
			{
				parts[0].makeSeriesStart();

				for (var i = 0; i < parts.length; i++)
				{
					parts[i].part = i + 1;
					parts[i].totalParts = parts.length;
				}
			}
			else
			{
				s.ungroup();
			}
			parts = [];
		}
		s = s.previous;
	}
}