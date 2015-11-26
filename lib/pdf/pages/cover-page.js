'use strict';

const BasePage = require('./pdf-page.js');
const ImageElement = require('../elements/image-element.js');
const RectangleElement = require('../elements/rectangle-element.js');
const Align = require('../elements/pdf-element.js').Align;
const Font = require('../elements/text-element.js').Font;

/**
 * @extends {BasePage}
 */
class CoverPage extends BasePage {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super((style === undefined) ? 'coverPage' : style);

		/** @type {ImageElement} */
		this.image = null;
		/** @type {TextElement} */
		this.summary = null;
		/** @type {RectangleElement} */
		this.overlay = null;
		/** @type {Number} */
		this.overlayWidth = 5;
	}

	updateLayout(pdf) {
		super.updateLayout(pdf);
		this.summary.alignContent = Align.Justify;
		this.image.fill(this.width, this.height);
		this.overlay.height = this.height;
	}

	/**
	 * @param {Post} post
	 * @returns {CoverPage}
	 */
	static fromPost(post) {
		let c = new CoverPage();

		c.hasPage = true;
		c.image = c.add(new ImageElement('coverImage'));
		c.overlay = c.add(new RectangleElement('coverOverlay'));

		c.addText(post.title, 'coverTitle');
		c.addText('by ' + post.author, 'coverByLine');
		c.addText(post.dateTaken, 'coverDate');

		c.summary = c.addText(post.description, 'coverSummary');
		c.alignContent = Align.Center;
		c.image.original = post.thumb.size.normal;

		return c;
	}

	///**
	// * @param {PDFDocument} pdf
	// * @param {function} callback
	// */
	//render(pdf, callback) {
	//	// PDF is always created with one page ready
	//	this.added = true;
	//	this.updateLayout(pdf);
	//	this.image.render(pdf, ()=> {
	//		pdf.moveTo(0, 0);
	//		super.render(pdf, callback);
	//		////.rect(Math.round((this.book.width - width) / 2), 0, width, this.book.height).fillOpacity(0.5).fill('white')
	//		//.moveDown(4).fillColor('black')
	//		//.font('heading').fontSize(40).text(this.title, { align: 'center' })
	//		//.moveDown(1)
	//		//.font('title').fontSize(15).text('by ' + this.author, { align: 'center' })
	//		//.text(this.storyDate, { align: 'center' });
	//	});
	//}
}

module.exports = CoverPage;