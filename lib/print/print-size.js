'use strict';

class PrintSize {
	/**
	 * @param {Number} [width]
	 * @param {Number} [height]
	 * @param {Number} [dpi]
	 */
	constructor(width, height, dpi) {
		/** @type {Number} */
		this.width = numOrNone(width);
		/** @type {Number} */
		this.height = numOrNone(height);
		/**
		 * @type {Number}
		 * @private
		 */
		this._dpi = numOrNone(dpi);
	}

	/**
	 * @param {Number} x
	 */
	set dpi(x) { this._dpi = x; }

	/**
	 * @returns {Number}
	 */
	get dpi() {
		if (this._dpi === 0) {
			throw(new Error('print DPI cannot be 0'));
		} else {
			return this._dpi;
		}
	}

	/**
	 * @returns {PrintSize}
	 */
	copy() {
		return new PrintSize(this.width, this.height, this._dpi);
	}
}

module.exports = PrintSize;

// - Private static members ---------------------------------------------------

function numOrNone(n) { return (is.number(n)) ? n : 0; }