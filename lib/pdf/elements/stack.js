'use strict';

const TI = require('../../');
const Layout = TI.PDF.Layout;
const is = TI.is;
const ElementGroup = TI.PDF.Element.Group;

/**
 * @extends ElementGroup
 * @extends PDFElement
 */
class Stack extends ElementGroup {
	/**
	 * @param {PDFLayout} layout
	 */
	updateLayout(layout) {
		layout.applyTo(this);

		let center = (this.alignContent === Layout.Align.Center);

		for (let el of this.elements) {
			el.explicitLayout(layout);
			el.scale(this.width, this.height);
			el.positionWithin(this.width, this.height);
			if (center) { el.center(this.width); }
		}
	}

	
}

module.exports = Stack;