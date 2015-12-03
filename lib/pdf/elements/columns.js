'use strict';

const is = require('../../is.js');
const ElementGroup = require('./element-group.js');
const Layout = require('../pdf-layout.js');

/**
 * @extends {ElementGroup}
 * @extends {PDFElement}
 */
class Columns extends ElementGroup {
	/**
	 * @param {PDFLayout} layout
	 */
	updateLayout(layout) {
		// add page number if given
		if (this.number > 0) { this.addText(this.number, 'pageNumber'); }
		super.applyStyle(layout);
	}
}

module.exports = Columns;