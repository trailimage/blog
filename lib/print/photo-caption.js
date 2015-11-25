'use strict';

const ElementGroup = require('./element-group.js');

/**
 * @extends {ElementGroup}
 * @extends {PrintElement}
 */
class PhotoCaption extends ElementGroup {
	constructor(text) {
		super();
		// parse text into paragraphs, quotes and footnotes
		this.addText(text);
	}
}

module.exports = PhotoCaption;