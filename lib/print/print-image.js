'use strict';

const PrintArea = require('./print-area.js');
const db = require('../config.js').provider;
const http = require('http');

/**
 * @extends {PrintArea}
 */
class PrintImage extends PrintArea {
	/**
	 * @param {PrintBook} book
	 */
	constructor(book) {
		super(book);
		/** @type {Size} */
		this.original = null;
	}

	/**
	 * Whether image is portrait orientation
	 * @returns {Boolean}
	 */
	get isPortrait() {
		return (this.original !== null && this.original.height > this.original.width);
	}

	/**
	 * @param {PrintCaption} caption
	 */
	fitAbove(caption) {
		caption.fullWidth();

		this.width = this.book.width;
		this.height = this.book.height - caption.height;
	}

	/**
	 *
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
			this.book.renderImage(buffer, this);
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
	let req = http.get(this.original.url.replace('https', 'http'), res => {
		let body = '';
		res.setEncoding('binary');
		res.on('data', chunk => { body += chunk; });
		res.on('end', () => { callback(new Buffer(body, 'binary')); })
	});
	req.on('error', e => { db.log.error(e.message); });
}