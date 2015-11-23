'use strict';

const PrintArea = require('./print-area.js');

/**
 * @extends {PrintArea}
 */
class PrintCaption extends PrintArea {
	constructor() {
		super();

		/**
		 * @type {PrintFootnotes}
		 */
		this.footnotes = null;
	}
}

module.exports = PrintCaption;