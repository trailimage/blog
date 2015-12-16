'use strict';

const TI = require('../../');
const is = TI.is;
const Area = TI.PDF.Element.Area;

/**
 * Base class for printable elements
 * -alias TI.PDF.Element.Base
 * (namespacing base classes breaks IDE type checking)
 */
class ElementBase {
	/**
	 * All dimensions in inches
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		/**
		 * Right-side distance from containing area
		 * @type Number
		 */
		this.right = NaN;
		/**
		 * Bottom distance from containing area
		 * @type Number
		 */
		this.bottom = NaN;
		/**
		 * Dimensions
		 * @type TI.PDF.Element.Area
		 */
		this.area = new Area();
		/** @type Number */
		this.minWidth = NaN;
		/** @type Number */
		this.minHeight = NaN;

		/**
		 * How to scale element
		 * @type String
		 */
		this.scaleTo = TI.PDF.Scale.None;

		/**
		 * Style name to match in pdf-style.json rules
		 * @type String
		 */
		this.style = style;

		/**
		 * RGBA color
		 * @type Number[]
		 */
		this._color = [0, 0, 0, 1];

		/**
		 * RGBA background color
		 * @type Number[]
		 */
		this.backgroundColor = [];

		/** @type Number */
		this.zIndex = 0;
	}

	/** @param {Number} n */
	set width(n) { this.area.width = n; }
	/** @returns {Number} */
	get width() { return this.area.width; }

	/** @param {Number} n */
	set height(n) { this.area.height = n; }
	/** @returns {Number} */
	get height() { return this.area.height; }

	/** @param {Number} n */
	set left(n) { this.area.left = n; }
	/** @returns {Number} */
	get left() { return this.area.left; }

	/** @param {Number} n */
	set top(n) { this.area.top = n; }
	/** @returns {Number} */
	get top() { return this.area.top; }

	/** @param {Number} n */
	set pageTop(n) { this.area.pageTop = n; }
	/** @returns {Number} */
	get pageTop() { return this.area.pageTop; }

	/** @param {Number} n */
	set pageLeft(n) { this.area.pageLeft = n; }
	/** @returns {Number} */
	get pageLeft() { return this.area.pageLeft; }

	/** @returns {{horizontal: string, vertical: string}} */
	get align() { return this.area.align; }

	/**
	 * RGB color array
	 * @returns {Number[]}
	 */
	get color() {
		if (is.array(this._color)) {
			return (this._color.length > 3) ? this._color.slice(0, 3) : this._color;
		} else {
			return [0, 0, 0];
		}
	}

	/**
	 * RGB color array
	 * @param {Number[]} c
	 */
	set color(c) { this._color = c; }

	/**
	 * Opacity level between 0 and 1
	 * @returns {Number}
	 */
	get opacity() {
		return (is.array(this._color) && this._color.length > 3) ? this._color[3] : 1;
	}

	/**
	 * Opacity level between 0 and 1
	 * @param {Number} a
	 */
	set opacity(a) {
		if (is.array(this._color)) {
			this._color[3] = a;
		} else {
			this._color = [0, 0, 0, a];
		}
	}

	/**
	 * Whether full layout is defined for PDF rendering
	 * @returns {Boolean}
	 */
	get laidOut() { return !this.area.isEmpty; }

	/**
	 * Set width and height for elements with anchored opposite edges
	 * Previously set width and height will be replaced
	 * @param {TI.PDF.Element.Area} container
	 */
	scale(container) {
		if (!isNaN(this.left) && !isNaN(this.right)) {
			// adjust width to fit left and right parameters
			this.width = container.width - (this.left + this.right);
		}

		if (!isNaN(this.top) && !isNaN(this.bottom)) {
			// adjust height to fit top and bottom parameters
			this.height = container.height - (this.top + this.bottom);
		}
	}

	/**
	 * Apply alignment rules
	 * @param {TI.PDF.Element.Area} container
	 */
	alignWithin(container) {
		this.area.inherit(container);
		// populate calculable values so anything left undefined is genuinely unknown
		this.updateSizeWithin(container);

		// alignments never override explicit dimensions
		switch (this.area.align.horizontal) {
			case TI.PDF.Align.Left: if (isNaN(this.left)) { this.left = 0; } break;
			case TI.PDF.Align.Right: if (isNaN(this.left) || isNaN(this.width)) { this.right = 0; } break;
			case TI.PDF.Align.Center: {
				if (!isNaN(container.width) && isNaN(this.left)) {
					this.left = (container.width - this.width) / 2;
				}
			}
		}

		switch (this.area.align.vertical) {
			case TI.PDF.Align.Top: if(isNaN(this.top)) { this.top = 0; } break;
			case TI.PDF.Align.Bottom: if(isNaN(this.top) || isNaN(this.height)) { this.bottom = 0; } break;
			case TI.PDF.Align.Center: {
				if (!isNaN(container.height) && isNaN(this.top)) {
					this.top = (container.height - this.height) / 2;
				}
			}
		}

		this.updateSizeWithin(container);

		if (!isNaN(this.bottom) && !isNaN(this.height) && isNaN(this.top)) {
			// bottom and height are given but not top -- position relative to bottom
			this.top = container.height - (this.height + this.bottom);
		}

		if (!isNaN(this.right) && !isNaN(this.width) && isNaN(this.left)) {
			// right and width are given but not left -- position relative to right
			this.left = container.width - (this.width + this.right);
		}
	}

	/**
	 * @param {TI.PDF.Element.Area} container
	 */
	offsetWithin(container) { this.area.add(container); }

	/**
	 * Apply style rules, add parent dimensions and calculate missing values
	 * @param {TI.PDF.Layout} layout
	 * @param {TI.PDF.Element.Area} [container] Container area
	 */
	explicitLayout(layout, container) {
		layout.applyTo(this);

		if (container !== undefined) {
			this.scale(container);
			this.alignWithin(container);
			this.offsetWithin(container);
		}
	}

	/**
	 * Calculate missing area values
	 * @param {TI.PDF.Element.Area} [container]
	 */
	implicitLayout(container) {
		if (is.value(container)) {
			//if (this.area.isEmpty) { this.area.copy(area); }
			//this.area.add(container);
		}
	}

	/**
	 * @param {TI.PDF.Layout} layout
	 * @param {function} [callback]
	 */
	render(layout, callback) { this.explicitLayout(layout); }

	/**
	 * Top offset in pixels
	 * @returns {Number}
	 */
	get topPixels() { return TI.PDF.inchesToPixels(this.top); }

	/**
	 * Left offset pixels
	 * @returns {Number}
	 */
	get leftPixels() { return TI.PDF.inchesToPixels(this.left); }

	/**
	 * Width in pixels
	 * @returns {Number}
	 */
	get widthPixels() { return TI.PDF.inchesToPixels(this.width); }

	/**
	 * Set width in pixels
	 * @param {Number} p
	 */
	set widthPixels(p) { this.width = TI.PDF.pixelsToInches(p); }

	/**
	 * Height in pixels
	 * @alias TI.PDF.Element.Base.heightPixels
	 * @returns {Number}
	 */
	get heightPixels() { return TI.PDF.inchesToPixels(this.height); }

	/**
	 * Set height in pixels
	 * @param {Number} p
	 */
	set heightPixels(p) { this.height = TI.PDF.pixelsToInches(p); }

	/**
	 * Calculate left offset to center within width
	 * @param {Number} [width]
	 */
	horizontalCenter(width) {
		if (isNaN(this.width)) {
			this.align.horizontal = TI.PDF.Align.Center;
		} else {
			this.left = (width - this.width) / 2;
		}
	}

	/**
	 * Calculate top offset to center within height
	 * @param {Number} height
	 */
	verticalCenter(height) {
		if (isNaN(this.height)) {
			this.align.vertical = TI.PDF.Align.Center;
		} else {
			this.top = (height - this.height) / 2;
		}
	}

	/**
	 * Calculate top and left if other values are known
	 * @param {TI.PDF.Element.Area} container
	 */
	updateSizeWithin(container) {
		this.area.calculate(container, this.bottom, this.right);
	}
}

ElementBase.prototype.center = ElementBase.prototype.horizontalCenter;

module.exports = ElementBase;