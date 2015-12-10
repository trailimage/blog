'use strict';

/**
 * @namespace
 * @name PdfNamespace
 * @property {PDFBook} Book
 * @property {PDFLayout} Layout
 * @property {PDFPage} Page
 * @property {PdfElementNamespace} Element
 */
class PdfNamespace {
	/**
	 * @returns {PDFBook}
	 * @constructor
	 */
	static get Book() { return require('./pdf-book.js'); }

	/**
	 * @returns {PDFLayout}
	 * @constructor
	 */
	static get Layout() { return require('./pdf-layout.js'); }

	/**
	 * @returns {PDFPage}
	 * @constructor
	 */
	static get Page() { return require('./pdf-page.js'); }
}

/**
 * @returns {PDFElement}
 */
PdfNamespace.Element = require('./elements');

module.exports = PdfNamespace;