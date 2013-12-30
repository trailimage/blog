"use strict";

var Format = require('./../format.js');

/**
 * Collection of other groups or schema items
 * @param {Flickr.Collection} api
 * @constructor
 */
function MetadataCollection(api)
{
	/** @type {MetadataCollection} */
	var _this = this;
	/** @type {String} */
	this.title = api.title;
	/** @type {String} */
	this.slug = Format.slug(api.title);
	/** @type {Array.<MetadataCollection>} */
	this.collections = [];
	/** @type {Array.<MetadataSet>} */
	this.sets = [];

	/**
	 * Find child group with name or slug
	 * @param {String} slug
	 * @return {MetadataCollection}
	 */
	this.withName = function(slug)
	{
		for (var i = 0; i < _this.collections.length; i++)
		{
			if (_this.collections[i].title == slug || _this.collections[i].slug == slug)
			{
				return _this.collections[i];
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

module.exports = MetadataCollection;