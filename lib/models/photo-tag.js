"use strict";

var setting = require('../settings.js');
var library = require('./library.js');
var log = require('winston');
var db = require('../adapters/hash.js');

const schema = 'model';

exports.key = 'photoTags';

/**
 * Reload photo tags
 * @param {function} [callback]
 */
exports.reload = function(callback)
{
	db.at(schema).remove(exports.key, function(done)
	{
		if (done)
		{
			log.warn('Removed photo tags');
			exports.load(callback);
		}
		else
		{
			log.error('Failed to remove photo tags');
			if (callback) { callback(); }
		}
	});
};

/**
 * @param {function} [callback]
 */
exports.load = function(callback)
{
	db.at(schema).getObject(exports.key, function(o)
	{
		if (o != null)
		{
			library.photoTags = o;
			log.info("Photo tags loaded from cache");
			if (callback) { callback(); }
		}
		else
		{
			let flickr = require('../adapters/flickr.js');

			library.photoTags = {};

			flickr.getTags(function(r)
			{
				let tags = r.who.tags.tag;
				let text = null;

				for (let i = 0; i < tags.length; i++)
				{
					text = tags[i].raw[0]._content;

					if (text.indexOf('=') == -1 && setting.removeTag.indexOf(text) == -1)
					{
						// not a machine tag and not a tag to be removed
						library.photoTags[tags[i].clean] = text;
					}
				}
				db.at(schema).add(exports.key, library.photoTags);
				log.info("%s photo tags loaded from Flickr", tags.length);
				if (callback) { callback(); }
			});
		}
	});
};