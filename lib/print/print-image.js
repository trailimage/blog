'use strict';

const PrintArea = require('./print-area.js');
const config = require('../config.js');
const is = require('../is.js');
const db = config.provider;
const request = require('request');

/**
 * @extends {PrintArea}
 */
class PrintImage extends PrintArea {
	/**
	 * @param {PrintBook} book
	 */
	constructor(book) {
		super(book);
		/**
		 * Original image parameters from source
		 * @type {Size}
		 */
		this.original = null;
		/**
		 * Image title
		 * @type {String}
		 */
		this.title = null;
	}

	/**
	 * Whether image is portrait orientation
	 * @returns {Boolean}
	 */
	get isPortrait() {
		return (this.original !== null && this.original.height > this.original.width);
	}

	/**
	 * Adjust image dimensions to fit above caption box
	 * @param {PrintCaption} caption
	 */
	fitAbove(caption) {
		caption.fullWidth();

		this.width = this.book.width;
		this.height = this.book.height - caption.height;
	}

	/**
	 * Adjust image dimensions to fit beside caption box
	 * @param {PrintCaption} caption
	 */
	fitBeside(caption) {
		caption.besideImage(this);

		this.width = this.book.width - caption.width;
		this.height = this.book.height;
	}

	/**
	 * @param {ServerResponse|function} callback
	 */
	render(callback) {
		getImage(this.original.url, buffer => {
			this.book.pdf.image(buffer, this.topInches, this.leftInches, { fit: [this.widthInches, this.heightInches] });
			callback();
		});
	}
}

module.exports = PrintImage;

// - Private static members ---------------------------------------------------

/**
 * Load image bytes
 * @param {String} url
 * @param {function(Buffer)} callback
 */
function getImage(url, callback) {
	// null encoding defaults to binary Buffer
	let options = { url: url, encoding: null };

	if (!is.empty(config.proxy)) { options.proxy = config.proxy; }

	request(options, (error, response, data) => {
		if (error !== null) {
			db.log.error('%s when accessing %s', error.toString(), url);
		} else {
			callback(data);
		}
	});
}