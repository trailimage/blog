'use strict';

const PrintPage = require('./print-page.js');
const ImageElement = require('../element/image-element.js');

/**
 * @extends {PrintPage}
 */
class CoverPage extends PrintPage {
	/**
	 * @param {PrintSize} size
	 */
	constructor(size) {
		super(size);

		/** @type {String} */
		this.title = null;
		/** @type {String} */
		this.author = null;
		/** @type {String} */
		this.storyDate = null;
		/** @type {String} */
		this.summary = null;
		/** @type {ImageElement} */
		this.image = new ImageElement();
	}

	/**
	 * @param {Post} post
	 * @param {PrintSize} size
	 * @returns {CoverPage}
	 */
	static fromPost(post, size) {
		let c = new CoverPage(size);

		c.title = post.title;
		c.author = post.author;
		c.storyDate = post.dateTaken;
		c.summary = post.description;
		c.image.original = post.thumb.size.normal;
		c.image.fill();

		return c;
	}

	/**
	 * @param {ServerResponse|PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		let width = this.inchesToPixels(4.5);

		this.image.render(this.configure(pdf), ()=> {
			pdf.moveTo(0, 0)
				.rect(Math.round((this.book.width - width) / 2), 0, width, this.book.height).fillOpacity(0.5).fill('white')
				.moveDown(4).fillColor('black')
				.font('heading').fontSize(40).text(this.title, { align: 'center' })
				.moveDown(1)
				.font('title').fontSize(15).text('by ' + this.author, { align: 'center' })
				.text(this.storyDate, { align: 'center' });

			callback();
		});
	}
}

module.exports = CoverPage;