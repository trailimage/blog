'use strict';

const is = require('../is.js');
const format = require('../format.js');

class Size {
	constructor() {
		this.url = null;
		this.width = 0;
		this.height = 0;
	}

	/**
	 * Whether size is empty
	 * @returns {boolean}
	 */
	get empty() {
		return this.url === null && this.width === 0;
	}
}

module.exports = Size;