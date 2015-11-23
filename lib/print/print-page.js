'use strict';

const PrintArea = require('./print-area.js');
const http = require('http');

/**
 * @extends {PrintArea}
 */
class PrintPage extends PrintArea {
	/**
	 * @param {PDFDocument} pdf
	 */
	constructor(pdf) {
		super();
		/** @type {PrintImage} */
		this.image = null;
		/** @type {PrintFootnotes} */
		this.caption = null;
		/** @type {PDFDocument} */
		this.pdf = pdf;
	}

	/**
	 * @param {PDFDocument} pdf
	 * @param {Photo} photo
	 * @param {function(PrintPage)} callback
	 */
	static fromPhoto(pdf, photo, callback) {
		let p = new PrintPage(pdf);
		let size = photo.size.normal;

		getImage(size.url, buffer => {
			pdf.addPage({margins: {top: 0, right: 0, bottom: 0, left: 0}, layout: 'landscape'});

			if (size.width > size.height) {
				this._landscapePage(p.description, size, buffer);
			} else {
				this._portraitPage(p.description, size, buffer);
			}
			//writePdfPhoto(pdf, photos, index + 1, callback);
			callback(p);
		});
	}

	/**
	 * @param {String} caption
	 * @param {Size} imageSize
	 * @param {Buffer} buffer
	 */
	_landscapePage(caption, imageSize, buffer) {
		let textOption = { width: (pageWidth - (2 * textMargin)) * dpi };
		// text height plus an inch
		let textHeight = pdf.heightOfString(caption, textOption) + (dpi * textMargin);

		this.pdf.image(buffer, { fit: [pageWidth * dpi, (pageHeight * dpi) - textHeight] });
		this.pdf.text(caption, dpi * textMargin, null, textOption);
	}

	/**
	 * @param {String} caption
	 * @param {Size} imageSize
	 * @param {Buffer} buffer
	 */
	_portraitPage(caption, imageSize, buffer) {
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

		this.pdf.image(buffer, { fit: [maxWidth, maxHeight] });
		this.pdf.text(caption, textLeft, null, textOption);
	}
}

module.exports = PrintPage;

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