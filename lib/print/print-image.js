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

	render() {
		getImage(this.original.url, buffer => {
			this.book.pdf.image(buffer, { fit: [this.pixelWidth, this.pixelHeight] });
		});
	}
}

module.exports = PrintImage;

// - Private static members ---------------------------------------------------

/**
 * Download image byte array
 * @param {String} url
 * @param {function(Buffer)} callback
 * @see http://stackoverflow.com/questions/12740659/downloading-images-with-node-js
 * @see https://github.com/request/request#streaming
 */
function getImage(url, callback) {
	let req = http.get(url.replace('https', 'http'), res => {
		let body = '';
		res.setEncoding('binary');
		res.on('data', chunk => { body += chunk; });
		res.on('end', () => { callback(new Buffer(body, 'binary')); })
	});
	req.on('error', e => { db.log.error(e.message); });
}