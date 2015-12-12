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
	 * @constructor
	 */
	static get Book() { return require('./pdf-book.js'); }

	/**
	 * @constructor
	 */
	static get Layout() { return require('./pdf-layout.js'); }

	/**
	 * @constructor
	 */
	static get Page() { return require('./pdf-page.js'); }

	/**
	 * @namespace TI.PDF.inchesToPixels
	 * @param {Number} inches
	 * @returns {Number}
	 */
	static inchesToPixels(inches) { return inches * dpi; }

	/**
	 * @namespace TI.PDF.pixelsToInches
	 * @param {Number} pixels
	 * @returns {Number}
	 */
	static pixelsToInches(pixels) { return pixels / dpi; }

	/**
	 * Replace NaN with number
	 * @namespace TI.PDF.ifNaN
	 * @param {Number} n Value to check
	 * @param {Number} r Replacement if n isn't a number
	 * @returns {Number}
	 */
	static ifNaN(n, r) { return isNaN(n) ? r : n; }
}

/**
 * @type {PDFElement}
 */
PdfNamespace.Element = require('./elements');

/**
 * @namespace TI.PDF.Align
 * @type {Object.<String, String>}
 */
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

/**
 * @namespace TI.PDF.Scale
 * @type {Object.<String, String>}
 */
PdfNamespace.Scale = {
	Fit: 'fit',
	Fill: 'fill',
	None: 'none'
};

/**
 * @namespace TI.PDF.Orientation
 * @type {Object.<String, String>}
 */
PdfNamespace.Orientation = {
	Landscape: 'landscape',
	Portrait: 'portrait'
};

/**
 * @namespace TI.PDF.Size
 */
PdfNamespace.Size = {
	Letter: 'letter',
	Legal: 'legal'
};

module.exports = PdfNamespace;