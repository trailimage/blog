'use strict';

const PDFPage = require('./pdf-page.js');
const RectangleElement = require('../elements/rectangle-element.js');

/**
 * @extends {PDFPage}
 */
class CoverPage extends PDFPage {
	/**
	 * @param {Post} post
	 * @returns {CoverPage}
	 */
	static fromPost(post) {
		let c = new CoverPage('coverPage');

		c.pdfReady = true;
		c.addImage(post.thumb.size.normal, 'coverImage');
		c.add(new RectangleElement('coverOverlay'));
		c.addText(post.title, 'coverTitle');
		c.addText('by ' + post.author, 'coverByLine');
		c.addText(post.dateTaken, 'coverDate');
		c.addText(post.description, 'coverSummary');

		return c;
	}
}

module.exports = CoverPage;