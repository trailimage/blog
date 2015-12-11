'use strict';

/**
 * PDF DPI is always 72 though images can be higher
 * @see https://github.com/devongovett/pdfkit/issues/268
 * @type {Number}
 */
const dpi = 72;

/**
 * @namespace TI.PDF
 */
class PdfNamespace {
	/**
	 * @namespace TI.PDF.Book
	 * @type {PDFBook}
	 * @constructor
	 */
	static get Book() { return require('./pdf-book.js'); }

	/**
	 * @namespace TI.PDF.Layout
	 * @returns {PDFLayout}
	 * @constructor
	 */
	static get Layout() { return require('./pdf-layout.js'); }

	/**
	 * @namespace TI.PDF.Page
	 * @returns {PDFPage}
	 * @constructor
	 */
	static get Page() { return require('./pdf-page.js'); }

	/**
	 * @param {Number} inches
	 * @returns {Number}
	 */
	static inchesToPixels(inches) { return inches * dpi; }

	/**
	 * @param {Number} pixels
	 * @returns {Number}
	 */
	static pixelsToInches(pixels) { return pixels / dpi; }
}

/**
 * @type {PDFElement}
 */
PdfNamespace.Element = require('./elements');

PdfNamespace.Align = {
	Left: 'left',
	Center: 'center',
	Right: 'right',
	Top: 'top',
	Middle: 'middle',
	Bottom: 'bottom',
	Justify: 'justify',
	Inherit: 'inherit'
};

PdfNamespace.Scale = {
	Fit: 'fit',
	Fill: 'fill',
	None: 'none'
};

PdfNamespace.Orientation = {
	Landscape: 'landscape',
	Portrait: 'portrait'
};

PdfNamespace.Size = {
	Letter: 'letter',
	Legal: 'legal'
};

module.exports = PdfNamespace;