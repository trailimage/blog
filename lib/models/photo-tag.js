'use strict';

const config = require('../config.js');
const library = require('./library.js').current;
const is = require('../is.js');
const log = config.provider.log;
const cache = config.provider.cache;



/**
 * More of a utility class for photo tags
 */
class PhotoTag {
	/**
	 * @param {Flickr.TagSummary[]} flickrTags
	 * @param {String[]} [exclusions]
	 * @return {Object.<String>}
	 */
	static parse(flickrTags, exclusions) {
		if (exclusions === undefined) { exclusions = []; }
		/** @type {Object.<String>} */
		let tags = {};

		for (let t of flickrTags) {
			let text = t.raw[0]._content;

			if (text.indexOf('=') == -1 && exclusions.indexOf(text) == -1) {
				// not a machine tag and not a tag to be removed
				tags[t.clean] = text;
			}
		}
		return tags;
	}
}

module.exports = PhotoTag;