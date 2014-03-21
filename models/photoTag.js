"use strict";

var Setting = require('./../settings.js');
/** @type {singleton} */
var Flickr = require('./../adapters/flickr.js');
var log = require('winston');

function PhotoTag() { }

PhotoTag.key = 'photoTags';

/**
 * Reload photo tags
 * @param {function} callback
 */
PhotoTag.refresh = function(callback)
{
	var cloud = require('./../adapters/redis.js').current;

	cloud.delete(PhotoTag.key, function(done)
	{
		if (done)
		{
			log.warn('Removed photo tags');
			PhotoTag.load(callback);
		}
		else
		{
			log.error('Failed to remove photo tags');
			callback();
		}
	});
};

/**
 * @param {function} [callback]
 */
PhotoTag.load = function(callback)
{
	var key = PhotoTag.key;
	var cloud = require('./../adapters/redis.js').current;
	var library = require('./library.js').current;

	cloud.getObject(key, function(o)
	{
		if (o != null)
		{
			library.photoTags = o;
			log.info("Photo tags loaded from redis");
			if (callback) { callback(); }
		}
		else
		{
			library.photoTags = {};

			Flickr.current.getTags(function(r)
			{
				var tags = r.who.tags.tag;
				var text = null;

				for (var i = 0; i < tags.length; i++)
				{
					text = tags[i].raw[0]._content;

					if (text.indexOf('=') == -1 && Setting.removeTag.indexOf(text) == -1)
					{
						// not a machine tag and not a tag to be removed
						library.photoTags[tags[i].clean] = text;
					}
				}
				cloud.addObject(key, library.photoTags);
				log.info("%s photo tags loaded from Flickr", tags.length);
				if (callback) { callback(); }
			});
		}
	});
};

module.exports = PhotoTag;