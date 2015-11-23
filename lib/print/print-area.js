'use strict';

class PrintArea {
	constructor() {
		this.width = 0;
		this.height = 0;
		this.top = 0;
		this.left = 0;
		this.align = align.left;
		this.verticalAlign = align.top;
	}

	static get Align() { return align; }
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

