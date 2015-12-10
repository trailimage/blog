'use strict';

class PdfElementNamespace {
	static get Base() { return require('./pdf-element.js'); }
	static get Area() { return require('./element-area.js'); }
	static get Group() { return require('./element-group'); }
	static get Footnote() { return require('./footnote-element.js'); }
	static get Image() { return require('./image-element.js'); }
	static get Caption() { return require('./photo-caption.js'); }
	static get PhotoWell() { return require('./photo-well.js'); }
	static get Rectangle() { return require('./rectangle-element.js'); }
	static get Shape() { return require('./shape-element.js'); }
	static get Text() { return require('./text-element.js'); }
}

module.exports = PdfElementNamespace;