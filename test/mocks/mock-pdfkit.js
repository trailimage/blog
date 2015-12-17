'use strict';

/**
 * @alias TI.Mock.PDFDocument
 */
class MockPDFDocument {
	constructor(options) {
		this.title = null;
		this.author = null;
		/**
		 * Registered fonts
		 * @type {Object.<String, String>}
		 */
		this.fonts = {};
		this.x = 0;
		this.y = 0;
		/** @type String */
		this._font = null;
		/** @type Number */
		this._fontSize = 0;
		/** @type Number[] */
		this._fillColor = [];
	}

	/**
	 * @param {String} name
	 * @param {String} path
	 * @param {String} [family]
	 */
	registerFont(name, path, family) {
		this.fonts[name] = path;
	}

	/**
	 * @param {Object} options
	 */
	addPage(options) {

	}

	/** @param {String} f */
	font(f) { this._font = f; }
	/** @param {Number} s */
	fontSize(s) { this._fontSize = s; }

}

module.exports = MockPDFDocument;