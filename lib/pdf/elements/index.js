'use strict';

/**
 * @namespace TI.PDF.Element
 */
class PdfElementNamespace {
	/**
	 * @namespace TI.PDF.Element.Base
	 * @constructor
	 */
	static get Base() { return require('./pdf-element.js'); }

	/**
	 * @namespace TI.PDF.Element.Offset
	 * @constructor
	 */
	static get Offset() { return require('./element-offset.js'); }

	/**
	 * @namespace TI.PDF.Element.Group
	 * @constructor
	 */
	static get Group() { return require('./element-group'); }

	/**
	 * @namespace TI.PDF.Element.Footnote
	 * @constructor
	 */
	static get Footnote() { return require('./footnote-element.js'); }

	/**
	 * @namespace TI.PDF.Element.Image
	 * @constructor
	 */
	static get Image() { return require('./image-element.js'); }

	/**
	 * @namespace TI.PDF.Element.Caption
	 * @constructor
	 */
	static get Caption() { return require('./photo-caption.js'); }

	/**
	 * @namespace TI.PDF.Element.PhotoWell
	 * @constructor
	 */
	static get PhotoWell() { return require('./photo-well.js'); }

	/**
	 * @namespace TI.PDF.Element.Rectangle
	 * @constructor
	 */
	static get Rectangle() { return require('./rectangle-element.js'); }

	/**
	 * @namespace TI.PDF.Element.Shape
	 * @constructor
	 */
	static get Shape() { return require('./shape-element.js'); }

	/**
	 * @namespace TI.PDF.Element.Text
	 * @constructor
	 */
	static get Text() { return require('./text-element.js'); }
}

module.exports = PdfElementNamespace;