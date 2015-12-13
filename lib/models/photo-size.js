'use strict';

/**
 * Dimensions and URL for each available photo size
 * @alias TI.PhotoSize
 */
class PhotoSize {
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

module.exports = PhotoSize;