'use strict';

var setting = require('../settings.js');
var library = require('./library.js');
/** @type {winston|Object} */
var log = require('winston');
var db = require('../adapters/hash.js');

const key = 'model:photoTags';

/**
 * Reload photo tags
 * @param {function} [callback]
 */
exports.reload = callback => {
	db.remove(key, done => {
		if (done) {
			log.warn('Removed photo tags');
			exports.load(callback);
		} else {
			log.error('Failed to remove photo tags');
			if (callback) { callback(); }
		}
	});
};

/**
 * Load all photo tags
 * @param {function} [callback] Method to call after tags are loaded
 */
exports.load = callback => {
	db.getObject(key, o => {
		if (o != null) {
			library.photoTags = o;
			log.info("Photo tags loaded from cache");
			if (callback) { callback(); }
		} else {
			// if nothing cached then load from Flickr
			let flickr = require('../adapters/flickr.js');

			library.photoTags = {};

			flickr.getTags(r => {
				let tags = r.who.tags.tag;
				let text = null;

				for (let i = 0; i < tags.length; i++) {
					text = tags[i].raw[0]._content;

					if (text.indexOf('=') == -1 && setting.removeTag.indexOf(text) == -1) {
						// not a machine tag and not a tag to be removed
						library.photoTags[tags[i].clean] = text;
					}
				}
				// cache the tags
				db.add(key, library.photoTags);
				log.info("%s photo tags loaded from Flickr", tags.length);
				if (callback) { callback(); }
			});
		}
	});
};