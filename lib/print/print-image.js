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
	let options = { url: url, encoding: null };

	if (!is.empty(config.proxy)) { options.proxy = config.proxy; }

	request(options, (error, response, data) => {
		if (error !== null) {
			db.log.error('%s when accessing %s', error.toString(), url);
		} else {
			callback(data);
		}
	});


	//const encoding = 'binary';
	//url = url.replace('https', 'http');
	//let req = http.get(url, res => {
	//	let body = '';
	//	res.setEncoding(encoding);
	//	res.on('data', chunk => { body += chunk; });
	//	res.on('end', ()=> {	callback(new Buffer(body, encoding)); })
	//});
	//req.on('error', e => { db.log.error('%s when accessing %s', e.message, url); });
}