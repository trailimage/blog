'use strict';

const format = require('../format.js');
const library = require('../models/library.js').current;
const config = require('../config.js');
const db = config.provider;
const PDFDocument = require('pdfkit');
const PrintBook = require('../print/print-book.js');
const fs = require('fs');
const http = require('http');
const dpi = 72;
const textMargin = 0.5;
const pageWidth = 11;
const pageHeight = 8.5;

/**
 * Default route action
 * @see http://pdfkit.org/docs/getting_started.html
 */
exports.view = (req, res) => {
	/** @type {Post} */
	let post = library.postWithSlug(req.params['slug']);

	if (post !== null) {
		db.photo.loadPost(post, post => {
			let book = PrintBook.fromPost(post, res);

			pdf.moveDown(2);
			pdf.font('heading').fontSize(40).text(post.title, {align: 'center'});
			pdf.moveDown(1);
			pdf.font('title').fontSize(15).text('by Jason Abbott', {align: 'center'});
			pdf.text(post.dateTaken, {align: 'center'});

			pdf.font('text').fontSize(11);

			pdf.moveDown(2);

			writePdfPhoto(pdf, post.photos, 0, ()=> { pdf.pipe(res); pdf.end(); });
		});
	}
};



/**
 * @param {PDFDocument} pdf
 * @param {Photo[]} photos
 * @param {int} index
 * @param {Function} callback
 */
function writePdfPhoto(pdf, photos, index, callback) {
	if (index < photos.length) {
		let p = photos[index];
		let size = p.size.normal;

		getImage(size.url, buffer => {
			pdf.addPage({margins: {top: 0, right: 0, bottom: 0, left: 0}, layout: 'landscape'});

			if (size.width > size.height) {
				landscapePage(p.description, size, pdf, buffer);
			} else {
				portraitPage(p.description, size, pdf, buffer);
			}
			writePdfPhoto(pdf, photos, index + 1, callback);
		});
	} else {
		callback();
	}
}

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