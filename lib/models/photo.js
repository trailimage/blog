'use strict';

const format = require('./../format.js');
const setting = require('./../settings.js');
const flickr = require('../providers/flickr.js');
const Size = require('./size.js');

class Photo {
	/**
	 * @param {Flickr.PhotoSummary} s
	 */
	constructor(s) {
		this.id = s.id;
		this.index = 0;
		this.title = null;
		this.description = s.description;
		/**
		 * Initially populated with tag slugs then updated to tag names
		 * @type {String[]}
		 */
		this.tags = s.tags.split(' ');
		this.dateTaken = format.parseDate(s.datetaken);
		this.latitude = parseFloat(s.latitude);
		this.longitude = parseFloat(s.longitude);
		/**
		 * @type {Boolean}
		 */
		this.primary = (parseInt(s.isprimary) == 1);

		this.size = {
			thumb: new Size(s, flickr.size.small240),
			preview: new Size(s, flickr.size.small240),
			normal: new Size(s, [flickr.size.large1600, flickr.size.large1024, flickr.size.medium800, flickr.size.medium640]),
			big: new Size(s, flickr.size.large2048)
		}
	}
}

module.exports = Photo;