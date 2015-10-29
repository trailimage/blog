'use strict';

const is = require('./../is.js');
const format = require('./../format.js');

class Size {
	constructor() {
		this.url = null;
		this.width = 0;
		this.height = 0;
	}

	/**
	 * Whether size is empty
	 * @returns {boolean}
	 */
	get empty() {
		return this.url === null && this.width === 0;
	}

	/**
	 * @param {Flickr.PhotoSummary} s
	 * @param {String|String[]} sizeField Size or list of sizes in order of preference
	 * @return {Size}
	 */
	static parse(s, sizeField) {
		let field = null;
		let size = new Size();

		if (is.array(sizeField)) {
			// iterate through size preferences to find first that isn't empty
			for (field of sizeField) {
				// break with given size url assignment if it exists in the photo summary
				if (!is.empty(s[field])) { break; }
			}
		} else {
			field = sizeField;
		}

		if (field !== null) {
			let suffix = field.remove('url');

			if (!is.empty(s[field])) {
				size.url = s[field];
				size.width = parseInt(s['width' + suffix]);
				size.height = parseInt(s['height' + suffix]);
			}
		}
		return size;
	}
}

module.exports = Size;