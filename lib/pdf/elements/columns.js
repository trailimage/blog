'use strict';

const TI = require('../../');
const is = TI.is;
const ElementGroup = TI.PDF.Element.Group;
const Layout = TI.PDF.Layout;

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
		super.explicitLayout(layout);
	}
}

module.exports = Columns;