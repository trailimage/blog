'use strict';

const setting = require('../settings.js');
const library = require('./library.js').current;
const is = require('../is.js');
const log = require('../log.js');
const cache = require('../cache.js');

const key = 'model:photoTags';

/**
 * Reload photo tags
 * @param {function} [callback]
 */
exports.reload = callback => {
	cache.remove(key, done => {
		if (done) {
			log.warn('Removed photo tags');
			exports.load(callback);
		} else {
			log.error('Failed to remove photo tags');
			if (is.callable(callback)) { callback(); }
		}
	});
};

/**
 * Load all photo tags
 * @param {function} [callback] Method to call after tags are loaded
 */
exports.load = callback => {
	cache.getObject(key, o => {
		if (o !== null) {
			library.photoTags = o;
			log.info('Photo tags loaded from cache');
			if (is.callable(callback)) { callback(); }
		} else {
			// if nothing cached then load from Flickr
			let db = require('../db.js');

			library.photoTags = {};

			db.getTags(r => {
				let tags = r.who.tags.tag;

				for (let t of tags) {
					let text = t.raw[0]._content;

					if (text.indexOf('=') == -1 && setting.removeTag.indexOf(text) == -1) {
						// not a machine tag and not a tag to be removed
						library.photoTags[t.clean] = text;
					}
				}
				// cache the tags
				cache.add(key, library.photoTags);
				log.info('%s photo tags loaded from Flickr', tags.length);
				if (is.callable(callback)) { callback(); }
			});
		}
	});
};