'use strict';

const format = require('../format.js');
const library = require('../models/library.js').current;
const config = require('../config.js');
const db = config.provider;
const PDFDocument = require('pdfkit');
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
			let pdf = new PDFDocument({
				size: 'letter',
				layout: 'landscape',
				margins: 0,
				info: {
					Title: post.title,
					Author: 'Jason Abbott'
				}
			});

			//pdf.addPage({size: 'letter', layout: 'portrait'});
			pdf.registerFont('Serif', 'dist/fonts/lora-101b41c4d985d4e5b5addbed77bbedfc1d55d89a.ttf', 'Lora');
			pdf.registerFont('San Serif', 'dist/fonts/droidsans-ea469d63bf279daeb58f104d71e6e0f0d62f93af.ttf', 'Droid Sans');
			pdf.registerFont('San Serif Bold', 'dist/fonts/oswald-641e7f512fab8283a2a459253c6e3a148216997e.ttf', 'Oswald');

			pdf.moveDown(2);
			pdf.font('San Serif Bold').fontSize(40).text(post.title, {align: 'center'});
			pdf.moveDown(1);
			pdf.font('San Serif').fontSize(15).text('by Jason Abbott', {align: 'center'});
			pdf.text(post.dateTaken, {align: 'center'});

			pdf.font('Serif').fontSize(11);

			pdf.moveDown(2);

			writePdfPhoto(pdf, post.photos, 0, ()=> { pdf.pipe(res); pdf.end(); });
		});
	}
};

/**
 * @param {String} caption
 * @param {Size} imageSize
 * @param {PDFDocument} pdf
 * @param {Buffer} buffer
 */
function landscapePage(caption, imageSize, pdf, buffer) {
	let textOption = { width: (pageWidth - (2 * textMargin)) * dpi };
	// text height plus an inch
	let textHeight = pdf.heightOfString(caption, textOption) + (dpi * textMargin);

	pdf.image(buffer, { fit: [pageWidth * dpi, (pageHeight * dpi) - textHeight] });
	pdf.text(caption, dpi * textMargin, null, textOption);
}

/**
 * @param {String} caption
 * @param {Size} imageSize
 * @param {PDFDocument} pdf
 * @param {Buffer} buffer
 */
function portraitPage(caption, imageSize, pdf, buffer) {
	let textOption = { width: 2 * dpi };
	// two inches and the margin
	let textWidth = 2 + textMargin;
	let textLeft = dpi * textMargin;
	let maxWidth = (pageWidth - textWidth) * dpi;
	let maxHeight = pageHeight * dpi;
	let widthRatio = imageSize.width / maxWidth;
	let heightRatio = imageSize.height / maxHeight;

	if (widthRatio > heightRatio) {
		// width must shrink first
		textLeft = maxWidth;
	} else {
		// width will reduce more than height
		textLeft = maxWidth;
	}

	pdf.image(buffer, { fit: [maxWidth, maxHeight] });
	pdf.text(caption, textLeft, null, textOption);
}

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