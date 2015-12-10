'use strict';

/**
 * @namespace
 */
class PdfNamespace {
	static get Book() { return require('./pdf-book.js'); }
	static get Layout() { return require('./pdf-layout.js'); }
	static get Page() { return require('./pdf-page.js'); }
}

PdfNamespace.Element = require('./elements');

module.exports = PdfNamespace;