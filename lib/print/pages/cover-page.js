'use strict';

const PrintPage = require('./print-page.js');
const ImageElement = require('../elements/image-element.js');
const Align = require('../elements/print-element.js').Align;
const Font = require('../elements/text-element.js').Font;

/**
 * @extends {PrintPage}
 */
class CoverPage extends PrintPage {
	constructor() {
		super();

		/** @type {ImageElement} */
		this.image = new ImageElement();
	}


	updateLayout(pdf) {
		if (!this.laidOut) {
			super.updateLayout(pdf);
			this.image.fill(this.width, this.height);
		}
	}

	/**
	 * @param {Post} post
	 * @returns {CoverPage}
	 */
	static fromPost(post) {
		let c = new CoverPage();

		let title = c.addText(post.title);
		let byLine = c.addText('by ' + post.author);
		let storyDate = c.addText(post.dateTaken);
		let summary = c.addText(post.description);

		title.font = Font.Heading;
		title.fontSize = 40;
		title.margin.top = 2;

		storyDate.font = byLine.font = Font.SanSerif;
		byLine.fontSize = 15;

		summary.width = 5;
		summary.alignContent = Align.Justify;
		summary.margin.top = 1;

		c.alignContent = Align.Center;
		c.image.original = post.thumb.size.normal;

		return c;
	}

	/**
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		// PDF is always created with one page ready
		this.added = true;
		this.updateLayout(pdf);
		this.image.render(pdf, ()=> {
			pdf.moveTo(0, 0);
			super.render(pdf, callback);
			////.rect(Math.round((this.book.width - width) / 2), 0, width, this.book.height).fillOpacity(0.5).fill('white')
			//.moveDown(4).fillColor('black')
			//.font('heading').fontSize(40).text(this.title, { align: 'center' })
			//.moveDown(1)
			//.font('title').fontSize(15).text('by ' + this.author, { align: 'center' })
			//.text(this.storyDate, { align: 'center' });
		});
	}
}

module.exports = CoverPage;