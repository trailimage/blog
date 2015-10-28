'use strict';

const is = require('./../is.js');
const format = require('./../format.js');

class Size {
	/**
	 * @param {Flickr.PhotoSummary} s
	 * @param {String|String[]} size Size or list of sizes
	 */
	constructor(s, size) {
		let url = size;

		if (is.array(size)) {
			// iterate through size preferences to find first that isn't empty
			for (url of size) {
				if (!is.empty(s[url])) {
					break;
				}
			}
		}

		let suffix = url.remove('url');

		this.url = s[url];
		this.width = parseInt(s['width' + suffix]);
		this.height = parseInt(s['height' + suffix]);
	}
}

module.exports = Size;