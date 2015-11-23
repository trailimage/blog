'use strict';

/**
 * Base class for printable areas
 */
class PrintArea {
	/**
	 * @param {PrintBook} [book] Book this area is part of
	 */
	constructor(book) {
		this.width = 0;
		this.height = 0;
		this.top = 0;
		this.left = 0;
		this.align = align.left;
		this.verticalAlign = align.top;
		this.book = (book === undefined) ? null : book;
	}

	static get Align() { return align; }

	/**
	 * @param {ServerResponse|PDFDocument} target
	 */
	render(target) { }
}

module.exports = PrintArea;

// - Private static members ---------------------------------------------------

const align = {
	left: 0,
	center: 1,
	right: 2,
	top: 3,
	middle: 4,
	bottom: 5
};

