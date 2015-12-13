'use strict';

const TI = require('../../');
const ElementGroup = TI.PDF.Element.Group;

/**
 * @extends {TI.PDF.Element.Group}
 * @extends {TI.PDF.Element.Base}
 */
class Columns extends ElementGroup {
	/**
	 * @param {TI.PDF.Layout} layout
	 */
	explicitLayout(layout) {
		// add page number if given
		if (this.number > 0) { this.addText(this.number, 'pageNumber'); }
		super.explicitLayout(layout);
	}
}

module.exports = Columns;