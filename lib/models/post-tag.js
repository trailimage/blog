"use strict";

var _ = require('lodash/collection');
var format = require('./../format.js');

/**
 * Collection of posts
 * @param {Flickr.Collection} api
 * @constructor
 */
function PostTag(api)
{
	/** @type {PostTag} */
	const _this = this;
	/** @type {String} */
	this.title = api.title;
	/** @type {String} */
	this.slug = format.slug(api.title);
	/** @type {String} */
	this.icon = inferIcon(api.title);
	/** @type {PostTag[]} */
	this.tags = [];
	/** @type {Post[]} */
	this.posts = [];

	/**
	 * @param {String} title
	 * @returns {string}
	 * @see http://getbootstrap.com/components/
	 */
	function inferIcon(title)
	{
		switch (title)
		{
			case 'Who': return 'user';
			case 'What': return 'road';
			case 'When': return 'calendar';
			case 'Where': return 'globe';
			default: return 'tag';
		}
	}

	/**
	 * Load photos and info for all posts
	 * @param {Function} callback
	 */
	this.loadPhotos = function(callback)
	{
		let pending = _this.posts.length;

		_.each(_this.posts, function(p)
		{
			p.getPhotos(function() { if (--pending <= 0) { callback(); } });
		});
	};

	/**
	 * Find child tag with name or slug
	 * @param {String} slug
	 * @return {Tag}
	 */
	this.child = function(slug)
	{
		return _.find(_this.tags, function(t) { return t.title == slug || t.slug == slug; });
	};

	/**
	 * @param {String} name
	 * @returns {boolean}
	 */
	this.hasChild = function(name) { return _this.child(name) != null; }
}

module.exports = PostTag;