"use strict";

var Format = require('./../format.js');
var Enum = require('./../enum.js');
var Setting = require('./../settings.js');
/** @type {Post} */
var Post = require('./post.js');
/** @type {Tag} */
var Tag = require('./tag.js');
/** @type {winston} */
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
	 * @type {Array.<Post>}
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
	 * @returns {Array.<String>}
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
	 * @param {Array.<String>} [names] List of tag names or all if no list given
	 * @returns {Array.<String>}
	 */
	this.tagSlugs = function(names)
	{
		/** @type {Array.<String>} */
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
			addPost(new Post({'id': Setting.flickr.favoriteSet, 'title': 'Featured'}, false));
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
		/** @type {Array.<Post>} */
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

Library.key = 'metadata';
Library.tagKey = 'metadataTags';

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

	cloud.delete([Library.tagKey, Library.key], function(done)
	{
		if (done || (Library.current == null || Library.current.postInfoLoaded))
		{
			// replace schema if:
			// removed from cache or
			// there's no current instance or
			// there's a fully loaded current instance (unexpected)
			log.warn('Removed cache schema: reloading');
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
			var library = new Library(JSON.parse(hash.tree));
			/** @type {Post} */
			var post = null;

			for (var i = 0; i < library.posts.length; i++)
			{
				post = library.posts[i];
				post.addInfo(JSON.parse(hash[post.id]));
			}

			library.postInfoLoaded = true;
			Library.current = library;

			log.info('Loaded %d photo posts from redis with details', library.posts.length);
			loadPhotoTags(callback);
		}
		else
		{
			loadFromFlickr(function() { loadPhotoTags(callback); });
		}
	});
};

/**
 * @param {function} [callback]
 */
function loadPhotoTags(callback)
{
	var library = Library.current;

	cloud.getObject(Library.tagKey, function(o)
	{
		if (o != null)
		{
			library.photoTags = o;
			log.info("Photo tags loaded from redis");
			if (callback) { callback(); }
		}
		else
		{
			if (flickr == null) { flickr = require('./../flickr.js').current; }

			flickr.getTags(function(r)
			{
				var tags = r.who.tags.tag;
				var text = null;

				for (var i = 0; i < tags.length; i++)
				{
					text = tags[i].raw[0]._content;

					if (text.indexOf('=') == -1)
					{
						library.photoTags[tags[i].clean] = text;
					}
				}
				cloud.addObject(Library.tagKey, library.photoTags);
				log.info("%s photo tags loaded from Flickr", tags.length);
				if (callback) { callback(); }
			});
		}
	});
}

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
		log.info('Loaded %d photo posts from Flickr. Beginning detail retrieval.', library.posts.length);
		callback();
		loadPostInfo(0);
	});
}

/**
 * Asynchronously load additional information needed only by the RSS Feed
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
	var set = library.posts[index];

	flickr.getSetInfo(set.id, function(info)
	{
		//log.info('Loaded set detail %d/%d "%s"', index + 1, total, set.name());
		queue[set.id] = JSON.stringify(info);
		set.addInfo(info);
		loadPostInfo(index + 1);
	});
}

module.exports = Library;