'use strict';

/**
 * @namespace TI.PDF.Element
 */
class PdfElementNamespace {
	/**
	 * @returns {PDFElement}
	 * @constructor
	 */
	static get Base() { return require('./pdf-element.js'); }

	/**
	 * @returns {ElementArea}
	 * @constructor
	 */
	static get Area() { return require('./element-area.js'); }

	/**
	 * @returns {ElementGroup}
	 * @constructor
	 */
	static get Group() { return require('./element-group'); }

	/**
	 * @returns {FootnoteElement}
	 * @constructor
	 */
	static get Footnote() { return require('./footnote-element.js'); }

	/**
	 * @returns {ImageElement}
	 * @constructor
	 */
	static get Image() { return require('./image-element.js'); }

	/**
	 * @returns {PhotoCaption}
	 * @constructor
	 */
	static get Caption() { return require('./photo-caption.js'); }

	/**
	 * @returns {PhotoWell}
	 * @constructor
	 */
	static get PhotoWell() { return require('./photo-well.js'); }

	/**
	 * @returns {RectangleElement}
	 * @constructor
	 */
	static get Rectangle() { return require('./rectangle-element.js'); }

	/**
	 * @returns {ShapeElement}
	 * @constructor
	 */
	static get Shape() { return require('./shape-element.js'); }

	/**
	 * @returns {TextElement}
	 * @constructor
	 */
	static get Text() { return require('./text-element.js'); }
}

module.exports = PdfElementNamespace;