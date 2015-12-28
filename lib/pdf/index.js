'use strict';

/**
 * PDF DPI is always 72 though images can be higher
 * @see https://github.com/devongovett/pdfkit/issues/268
 * @type Number
 */
const dpi = 72;

/**
 * @namespace
 * @alias TI.PDF
 */
class PdfNamespace {
	/** @constructor */
	static get Book() { return require('./pdf-book.js'); }
	/** @constructor */
	static get Layout() { return require('./pdf-layout.js'); }
	/** @constructor */
	static get Page() { return require('./pdf-page.js'); }

	/**
	 * @alias TI.PDF.inchesToPixels
	 * @param {Number} inches
	 * @returns {Number}
	 */
	static inchesToPixels(inches) { return inches * dpi; }

	/**
	 * @alias TI.PDF.pixelsToInches
	 * @param {Number} pixels
	 * @returns {Number}
	 */
	static pixelsToInches(pixels) { return pixels / dpi; }

	/**
	 * Replace NaN with number
	 * @alias TI.PDF.ifNaN
	 * @param {Number} n Value to check
	 * @param {Number} r Replacement if n isn't a number
	 * @returns {Number}
	 */
	static ifNaN(n, r) { return isNaN(n) ? r : n; }
}

PdfNamespace.Element = require('./elements');

/**
 * @alias TI.PDF.Align
 * @type {Object.<String, String>}
 */
PdfNamespace.Align = {
	Left: 'left',
	Center: 'center',
	Right: 'right',
	Top: 'top',
	Bottom: 'bottom',
	Justify: 'justify',
	Inherit: 'inherit'
};

/**
 * @type {Object.<String, String>}
 */
PdfNamespace.Scale = {
	Fit: 'fit',
	Fill: 'fill',
	None: 'none'
};

/**
 * @alias TI.PDF.Orientation
 * @type {Object.<String, String>}
 */
PdfNamespace.Orientation = {
	Landscape: 'landscape',
	Portrait: 'portrait'
};

/**
 * @alias TI.PDF.Size
 */
PdfNamespace.Size = {
	Letter: 'letter',
	Legal: 'legal'
};

module.exports = PdfNamespace;