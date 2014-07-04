"use strict";

var format = require('./../format.js');

/**
 * Collection of posts
 * @param {Flickr.Collection} api
 * @constructor
 */
function Tag(api)
{
	/** @type {Tag} */
	var _this = this;
	/** @type {String} */
	this.title = api.title;
	/** @type {String} */
	this.slug = format.slug(api.title);
	/** @type {Tag[]} */
	this.tags = [];
	/** @type {Post[]} */
	this.posts = [];

	/**
	 * Load photos and info for all posts
	 * @param {Function} callback
	 */
	this.loadPhotos = function(callback) { loadPostPhotos(0, callback);	};

	/**
	 * @param {Number} index
	 * @param {Function} callback
	 */
	function loadPostPhotos(index, callback)
	{
		var total = _this.posts.length;

		if (index > total - 1) { callback(); return; }

		/** @type {Post} */
		var post = _this.posts[index];

		if (!post.photosLoaded || !post.infoLoaded)
		{
			post.getPhotos(function() { loadPostPhotos(index + 1, callback); });
		}
		else
		{
			loadPostPhotos(index + 1, callback);
		}
	}

	/**
	 * Find child tag with name or slug
	 * @param {String} slug
	 * @return {Tag}
	 */
	this.withName = function(slug)
	{
		for (var i = 0; i < _this.tags.length; i++)
		{
			if (_this.tags[i].title == slug || _this.tags[i].slug == slug)
			{
				return _this.tags[i];
			}
		}
		return null;
	};

	/**
	 * @param {String} name
	 * @returns {boolean}
	 */
	this.hasChild = function(name)
	{
		return _this.withName(name) != null;
	}
}

module.exports = Tag;