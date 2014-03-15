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
/** @type {FlickrAPI} */
var flickr = null;
/** @type {Cloud} */
var cloud = null;
/** @type {Object} */
var queue = {};

/**
 * @param {Flickr.Tree} api
 * @constructor
 */
function Library(api)
{
	/** @type {Library} */
	var _this = this;

	/**
	 * Root tags
	 * @type {Object.<Tag>}
	 */
	this.tags = {};
	/**
	 * Flat reference to all posts for simplified lookup
	 * @type {Post[]}
	 */
	this.posts = [];

	/**
	 * Hash of photo tags in hash[key] = name format
	 * @type {Object.<String>}
	 **/
	this.photoTags = {};

	/**
	 * Whether post information is loaded
	 * @returns {boolean}
	 */
	this.postInfoLoaded = false;

	function init()
	{
		for (var i = 0; i < api.collection.length; i++)
		{
			addTag(api.collection[i], true);
		}
		correlatePosts();
	}

	/**
	 * @returns {String[]}
	 */
	this.postSlugs = function()
	{
		var list = [];

		for (var i = 0; i < _this.posts.length; i++)
		{
			list.push(_this.posts[i].slug);
		}

		return list;
	};

	/**
	 * @param {String[]} [names] List of tag names or all if no list given
	 * @returns {String[]}
	 */
	this.tagSlugs = function(names)
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
				for (title in _this.tags)
				{
					parent = _this.tags[title];
					child = parent.withName(names[i]);
					if (child != null) { slugs.push(parent.slug + '/' + child.slug); }
				}
			}
		}
		else
		{
			for (title in _this.tags)
			{
				parent = _this.tags[title];

				for (i = 0; i < parent.tags.length; i++)
				{
					slugs.push(parent.slug + '/' + parent.tags[i].slug);
				}

			}
		}
		return slugs;
	};

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

		if (root) { _this.tags[t.title] = t; }

		if (api.set)
		{
			for (i = 0; i < api.set.length; i++)
			{
				p = _this.postWithID(api.set[i].id);

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
	 * @param {String} name
	 * @return {Tag}
	 */
	this.tagWithChild = function(name)
	{
		/** @type {Tag} */
		var g = null;

		for (var title in _this.tags)
		{
			g = _this.tags[title];
			if (g.hasOwnProperty('hasChild') && g.hasChild(name)) { return g; }
		}
		return null;
	};

	/**
	 * Match posts that are part of a series
	 */
	function correlatePosts()
	{
		/** @type {Post} */
		var s = _this.posts[0];
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

	/**
	 * Asynchronously load additional information used by the RSS feed and tag pages
	 * @param {Number} index
	 */
	function addPostInfo(index)
	{
		var total = _this.posts.length;

		if (index > total - 1)
		{
			_this.postInfoLoaded = true;
			log.info('Finished loading photo set details');
			return;
		}

		/** @type {Post} */
		var p = _this.posts[index];

		flickr.getSetInfo(p.id, function(info)
		{
			//log.info('Loaded set detail %d/%d "%s"', index + 1, total, set.name());
			p.addInfo(info);
			addPostInfo(index + 1);
		});
	}

	/**
	 * @param {String} id Set ID
	 * @returns {Post}
	 */
	this.postWithID = function(id)
	{
		for (var i = 0; i < _this.posts.length; i++)
		{
			if (_this.posts[i].id == id) { return _this.posts[i]; }
		}
		return null;
	};

	/**
	 * @param {String} slug
	 * @param {String} [partSlug = null]
	 * @returns {Post}
	 */
	this.postWithSlug = function(slug, partSlug)
	{
		if (partSlug) { slug += "/" + partSlug; }

		for (var i = 0; i < _this.posts.length; i++)
		{
			if (_this.posts[i].isMatch(slug)) { return _this.posts[i]; }
		}
		return null;
	};

	/**
	 * @param {Post} set
	 */
	function addPost(set)
	{
		for (var i = 0; i < _this.posts.length; i++)
		{
			if (_this.posts[i].id == set.id) { return; }
		}
		_this.posts.push(set);

		if (set.timebound && _this.posts.length > 1)
		{
			/** @type {Post} */
			var next = _this.posts[_this.posts.length - 2];

			if (next.timebound)
			{
				set.next = next;
				next.previous = set;
			}
		}
	}

	init();
}

Library.key = 'library';

/**
 * @type {Library}
 */
Library.current = null;

/**
 * @param {function} [callback]
 */
Library.refresh = function(callback)
{
	cloud = require('./../cloud.js').current;

	cloud.delete([PhotoTag.key, Library.key], function(done)
	{
		if (done || (Library.current == null || Library.current.postInfoLoaded))
		{
			// replace schema if:
			// removed from cache or
			// there's no current instance or
			// there's a fully loaded current instance (unexpected)
			log.warn('Removed library and photo tag cache: reloading');
			if (Library.current != null) { Library.current.postInfoLoaded = false; }
			Library.make(callback, true);
		}
		else
		{
			// implies schema is in the midst of loading but not cached yet
			if (callback) { callback(); }
		}
	});
};


/**
 * @param {function} [callback]
 * @param {boolean} [forceReload] Whether to force reload from Flickr (default is false)
 */
Library.make = function(callback, forceReload)
{
	cloud = require('./../cloud.js').current;

	cloud.getHash(Library.key, function(hash)
	{
		if (hash != null && !forceReload)
		{
			try
			{
				var library = new Library(JSON.parse(hash.tree));
				/** @type {Post} */
				var post = null;
				/** @type {String} */
				var value = null;

				for (var i = 0; i < library.posts.length; i++)
				{
					post = library.posts[i];
					value = hash[post.id];

					if (Format.isEmpty(value) || value == 'undefined')
					{
						log.error('Encountered invalid cached content for post %s: must reload', post.id);
						Library.refresh(callback);
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
				Library.refresh(callback);
				return;
			}

			library.postInfoLoaded = true;
			Library.current = library;

			log.info('Loaded %d photo posts from redis with details', library.posts.length);
			PhotoTag.load(callback);
		}
		else
		{
			loadFromFlickr(function() { PhotoTag.load(callback); });
		}
	});
};


/**
 * @param {function} [callback]
 */
function loadFromFlickr(callback)
{
	flickr = require('./../flickr.js').current;

	flickr.on('error', function(data)
	{
		log.error('Flickr not responding: %j', data);
		log.warn('Retrying in %d seconds', (Setting.retryDelay / Enum.time.second));
		setTimeout(function() { Library.make(callback); }, Setting.retryDelay);
	});

	flickr.getCollection(function(tree)
	{
		flickr.removeAllListeners('error');
		var library = new Library(tree);
		queue['tree'] = JSON.stringify(tree);
		Library.current = library;
		log.info('Loaded %d photo posts from Flickr: beginning detail retrieval', library.posts.length);
		callback();
		loadPostInfo(0);
	});
}

/**
 * Asynchronously load additional post information
 * @param {Number} index
 */
function loadPostInfo(index)
{
	var library = Library.current;
	var total = library.posts.length;

	if (index > total - 1)
	{
		library.postInfoLoaded = true;
		cloud.addHash(Library.key, queue);
		log.info('Finished loading photo set details');
		return;
	}

	/** @type {Post} */
	var post = library.posts[index];

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

module.exports = Library;