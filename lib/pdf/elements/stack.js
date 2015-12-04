'use strict';

const is = require('../../is.js');
const ElementGroup = require('./element-group.js');
const Layout = require('../pdf-layout.js');

/**
 * @extends {ElementGroup}
 * @extends {PDFElement}
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
		this.laidOut = true;
	}

	
}

module.exports = Stack;