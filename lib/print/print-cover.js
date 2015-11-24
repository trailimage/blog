'use strict';

const PrintArea = require('./print-area.js');
const PrintImage = require('./print-image.js');

class PrintCover extends PrintArea {
	/**
	 * @param {PrintBook} book
	 */
	constructor(book) {
		super(book);
		/** @type {String} */
		this.title = null;
		/** @type {String} */
		this.author = null;
		/** @type {String} */
		this.storyDate = null;
		/** @type {String} */
		this.summary = null;
		/** @type {PrintImage} */
		this.image = new PrintImage(book);
	}

	/**
	 * @param {PrintBook} book
	 * @param {Post} post
	 * @returns {PrintCover}
	 */
	static fromPost(book, post) {
		let c = new PrintCover(book);

		c.title = post.title;
		c.author = post.author;
		c.storyDate = post.dateTaken;
		c.summary = post.description;
		c.height = book.height;
		c.width = book.width;
		c.image.original = post.thumb.size.normal;
		c.image.fill();

		return c;
	}

	/**
	 * @param {ServerResponse|function} callback
	 */
	render(callback) {
		let width = this.inchesToPixels(4.5);

		this.image.render(()=> {
			this.book.pdf
				.moveTo(0, 0)
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

module.exports = PrintCover;