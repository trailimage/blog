"use strict";

var Format = require('./../format.js');
var Enum = require('./../enum.js');
var Setting = require('./../settings.js');
/** @type {MetadataSet} */
var MetadataSet = require('./set.js');
/** @type {MetadataCollection} */
var MetadataCollection = require('./collection.js');
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
function Metadata(api)
{
	/** @type {Metadata} */
	var _this = this;

	/**
	 * Root collections
	 * @type {Object.<MetadataCollection>}
	 */
	this.collections = {};
	/**
	 * Flat reference to all photo sets for simplified lookup
	 * @type {Array.<MetadataSet>}
	 */
	this.sets = [];

	/** @type {Object.<String>} */
	this.photoTags = {};

	/**
	 * Whether set information is loaded
	 * @returns {boolean}
	 */
	this.setInfoLoaded = false;

	function init()
	{
		for (var i = 0; i < api.collection.length; i++)
		{
			addCollection(api.collection[i], true);
		}
		correlateSets();
	}

	/**
	 * @returns {Array.<String>}
	 */
	this.setSlugs = function()
	{
		var list = [];

		for (var i = 0; i < _this.sets.length; i++)
		{
			list.push(_this.sets[i].slug);
		}

		return list;
	};

	/**
	 * @returns {Array.<String>}
	 */
	this.collectionSlugs = function()
	{
		/** @type {Array.<String>} */
		var slugs = [];
		/** @type {MetadataCollection} */
		var parent;

		for (var r in _this.collections)
		{
			parent = _this.collections[r];

			for (var i = 0; i < parent.collections.length; i++)
			{
				slugs.push(parent.slug + '/' + parent.collections[i].slug);
			}
		}
		return slugs;
	};

	/**
	 * Exchange tag names for tag slugs
	 * @param {Array.<String>} names List of tag names
	 * @returns {Array.<String>}
	 */
	this.tagSlugs = function(names)
	{
		/** @type {Array.<String>} */
		var slugs = [];
		/** @type {MetadataCollection} */
		var parent;
		/** @type {MetadataCollection} */
		var child;

		for (var i = 0; i < names.length; i++)
		{
			for (var r in _this.collections)
			{
				parent = _this.collections[r];
				child = parent.withName(names[i]);
				if (child != null) { slugs.push(parent.slug + '/' + child.slug); }
			}
		}
		return slugs;
	};

	/**
	 * Add Flickr collection to the tree
	 * @param {Flickr.Collection} api
	 * @param {Boolean} [root = false]
	 */
	function addCollection(api, root)
	{
		var c = new MetadataCollection(api),
			/** @type {MetadataSet} */
			s = null,
			/** @type {int} */
			i = 0;

		if (root) { _this.collections[c.title] = c; }

		if (api.set)
		{
			for (i = 0; i < api.set.length; i++)
			{
				s = _this.setWithID(api.set[i].id);

				// create item object if it isn't part of an already added group
				if (s == null) { s = new MetadataSet(api.set[i]); }

				s.addTag(c.title);
				c.sets.push(s);
				addSet(s);
			}
		}

		if (api.collection)
		{
			for (i = 0; i < api.collection.length; i++)
			{
				c.collections.push(addCollection(api.collection[i]));
			}
		}

		if (root)
		{
			addSet(new MetadataSet({'id': Setting.flickr.favoriteSet, 'title': 'Featured'}, false));
			addSet(new MetadataSet({'id': Setting.flickr.poemSet, 'title': 'Ruminations'}, false));
		}

		return c;
	}

	/**
	 * @param {String} name
	 * @return {MetadataCollection}
	 */
	this.collectionWithChild = function(name)
	{
		/** @type {MetadataCollection} */
		var g = null;

		for (var n in _this.collections)
		{
			g = _this.collections[n];
			if (g.hasOwnProperty('hasChild') && g.hasChild(name)) { return g; }
		}
		return null;
	};

	/**
	 * Match items that are part of the same story
	 */
	function correlateSets()
	{
		/** @type {MetadataSet} */
		var s = _this.sets[0];
		/** @type {Array.<MetadataSet>} */
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
					parts[0].makeGroupStart();

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
	function addSetInfo(index)
	{
		var total = _this.sets.length;

		if (index > total - 1)
		{
			_this.setInfoLoaded = true;
			log.info('Finished loading photo set details');
			return;
		}

		/** @type {MetadataSet} */
		var set = _this.sets[index];

		flickr.getSetInfo(set.id, function(info)
		{
			//log.info('Loaded set detail %d/%d "%s"', index + 1, total, set.name());
			set.addInfo(info);
			addSetInfo(index + 1);
		});
	}

	/**
	 * @param {String} id Set ID
	 * @returns {MetadataSet}
	 */
	this.setWithID = function(id)
	{
		for (var i = 0; i < _this.sets.length; i++)
		{
			if (_this.sets[i].id == id) { return _this.sets[i]; }
		}
		return null;
	};

	/**
	 * @param {String} slug
	 * @param {String} [partSlug = null]
	 * @returns {MetadataSet}
	 */
	this.setWithSlug = function(slug, partSlug)
	{
		if (partSlug) { slug += "/" + partSlug; }

		for (var i = 0; i < _this.sets.length; i++)
		{
			if (_this.sets[i].isMatch(slug)) { return _this.sets[i]; }
		}
		return null;
	};

	/**
	 * @param {MetadataSet} set
	 */
	function addSet(set)
	{
		for (var i = 0; i < _this.sets.length; i++)
		{
			if (_this.sets[i].id == set.id) { return; }
		}
		_this.sets.push(set);

		if (set.timebound && _this.sets.length > 1)
		{
			/** @type {MetadataSet} */
			var next = _this.sets[_this.sets.length - 2];

			if (next.timebound)
			{
				set.next = next;
				next.previous = set;
			}
		}
	}

	init();
}

Metadata.key = 'metadata';
Metadata.tagKey = 'metadataTags';

/**
 * @type {Metadata}
 */
Metadata.current = null;

/**
 * @param {function} [callback]
 */
Metadata.refresh = function(callback)
{
	cloud = require('./../cloud.js').current;

	cloud.delete([Metadata.tagKey, Metadata.key], function(done)
	{
		if (done || (Metadata.current == null || Metadata.current.setInfoLoaded))
		{
			// replace schema if:
			// removed from cache or
			// there's no current instance or
			// there's a fully loaded current instance (unexpected)
			log.warn('Removed cache schema: reloading');
			if (Metadata.current != null) { Metadata.current.setInfoLoaded = false; }
			Metadata.make(callback);
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
 */
Metadata.make = function(callback)
{
	cloud = require('./../cloud.js').current;

	cloud.getHash(Metadata.key, function(hash)
	{
		if (hash != null)
		{
			var metadata = new Metadata(JSON.parse(hash.tree));
			/** @type {MetadataSet} */
			var set = null;

			for (var i = 0; i < metadata.sets.length; i++)
			{
				set = metadata.sets[i];
				set.addInfo(JSON.parse(hash[set.id]));
			}

			metadata.setInfoLoaded = true;
			Metadata.current = metadata;

			log.info('Loaded %d photo sets from redis with details', metadata.sets.length);
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
	var metadata = Metadata.current;

	cloud.getObject(Metadata.tagKey, function(o)
	{
		if (o != null)
		{
			metadata.photoTags = o;
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
						metadata.photoTags[tags[i].clean] = text;
					}
				}
				cloud.addObject(Metadata.tagKey, metadata.photoTags);
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
		setTimeout(function() { Metadata.make(callback); }, Setting.retryDelay);
	});

	flickr.getCollection(function(tree)
	{
		flickr.removeAllListeners('error');
		var metadata = new Metadata(tree);
		queue['tree'] = JSON.stringify(tree);
		Metadata.current = metadata;
		log.info('Loaded %d photo sets from Flickr. Beginning detail retrieval.', metadata.sets.length);
		callback();
		loadSetInfo(0);
	});
}

/**
 * Asynchronously load additional information needed only by the RSS Feed
 * @param {Number} index
 */
function loadSetInfo(index)
{
	var metadata = Metadata.current;
	var total = metadata.sets.length;

	if (index > total - 1)
	{
		metadata.setInfoLoaded = true;
		cloud.addHash(Metadata.key, queue);
		log.info('Finished loading photo set details');
		return;
	}

	/** @type {MetadataSet} */
	var set = metadata.sets[index];

	flickr.getSetInfo(set.id, function(info)
	{
		//log.info('Loaded set detail %d/%d "%s"', index + 1, total, set.name());
		queue[set.id] = JSON.stringify(info);
		set.addInfo(info);
		loadSetInfo(index + 1);
	});
}

module.exports = Metadata;