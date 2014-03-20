"use strict";

var Format = require('./../format.js');

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
	this.slug = Format.slug(api.title);
	/** @type {Tag[]} */
	this.tags = [];
	/** @type {Post[]} */
	this.posts = [];

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