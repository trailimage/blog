'use strict';

const TI = require('../');
const is = TI.is;
const extend = require('extend');
const PDFDocument = require('pdfkit');

/**
 * Parse pdf-style.json and manage document
 * @alias TI.PDF.Layout
 */
class PDFLayout {
	/**
	 * @param {PDFStyleConfig} [style]
	 */
	constructor(style) {
		if (style === undefined) { style = require('../../pdf-style.json'); }
		/**
		 * @type PDFStyleSettings
		 */
		this.settings = extend({}, style.settings);
		/**
		 * @type PDFStyleRuleList
		 */
		this.rules = extend({}, style.rules);

		// replace color aliases with RGB values (pdfkit handles font aliases)
		for (let name in this.rules) {
			let rule = this._inherit(this.rules[name]);
			this._expandColors(rule, 'color');
			this._expandColors(rule, 'backgroundColor');
			this.rules[name] = rule;
		}

		/**
		 * @type PDFDocument
		 */
		this.pdf = null;
	}

	/**
	 * Create PDF to match style
	 * Assumes existence of a defaultPage style rule
	 * @param {String} title
	 * @param {String} author
	 * @returns {PDFDocument}
	 * @see http://pdfkit.org/docs/getting_started.html
	 */
	createDocument(title, author) {
		let options = this._pdfConfig('defaultPage');
		options.info = { Title: title, Author: author };
		this.pdf = new PDFDocument(options);

		// register fonts with document
		for (let f in this.settings.fonts) { this.pdf.registerFont(f, this.settings.fonts[f]); }

		return this.pdf;
	}

	/**
	 * Add page to PDF document
	 * @alias TI.PDF.Layout.addPage
	 * @param {TI.PDF.Element.Base|TI.PDF.Page|TI.PDF.Element.Group|PDFPage} el
	 * @returns {PDFDocument}
	 */
	addPage(el) {
		return this.pdf.addPage(this._pdfConfig(el.style))
	}

	/**
	 * Create PDF configuration for style page size and margins
	 * @param {String} style
	 * @returns {Object}
	 * @private
	 */
	_pdfConfig(style) {
		/** @type PDFStyleRule */
		let rule = this.rules[style];

		if (rule === undefined) { throw new ReferenceError('PDF style "' + style + '" is not defined'); }

		let w = TI.PDF.inchesToPixels(rule.width);
		let h = TI.PDF.inchesToPixels(rule.height);

		return {
			size: (w > h) ? [h, w] : [w, h],
			layout: (w > h) ? TI.PDF.Orientation.Landscape : TI.PDF.Orientation.Portrait,
			margins: {
				top: pdfMargin(rule, rule.marginTop),
				bottom: pdfMargin(rule, rule.marginBottom),
				left: pdfMargin(rule, rule.marginLeft),
				right: pdfMargin(rule, rule.marginRight)
			}
		}
	}

	/**
	 * Apply style to element
	 * @alias TI.PDF.Layout.applyTo
	 * @param {ElementBase|TI.PDF.Element.Base|TI.PDF.Page|TI.PDF.Element.Group} el
	 */
	applyTo(el) {
		let rules = this.rules[el.style];

		if (rules !== undefined) {
			for (let r in rules) {
				switch (r) {
					case "scale": el.scaleTo = rules[r]; break;
					// style position is always relative
					case "top": el.area.relativeTop = rules[r]; break;
					case "left": el.area.relativeLeft = rules[r]; break;
					// rules that directly match element properties:
					case "alignContent":
					case "verticalAlign":
					case "backgroundColor":
					case "bottom":
					case "color":
					case "font":
					case "fontSize":
					case "height":
					case "minWidth":
					case "right":
					case "width": el[r] = rules[r]; break;
				}
			}
		}
	}

	/**
	 * Replace color alias with color value
	 * @param {Object<String|Number[]>} rule Style rules
	 * @param {String} fieldName Field with color alias
	 * @parivate
	 */
	_expandColors(rule, fieldName) {
		let color = rule[fieldName];

		if (color !== undefined && !is.array(color) && is.defined(this.settings.colors, color)) {
			// if color value matches an alias then replace with RGB array
			rule[fieldName] = this.settings.colors[color];
		}
	}

	/**
	 * Recursively inherit styles
	 * @param {Object} rules
	 * @private
	 */
	_inherit(rules) {
		if (is.defined(rules,'inherit')) {
			rules = extend({}, this._inherit(this.rules[rules.inherit]), rules);
			delete rules['inherit'];
		}
		return rules;
	}
}

module.exports = PDFLayout;

// - Private static members ---------------------------------------------------

/**
 * @param {PDFStyleRule} r
 * @param {Number} m
 * @returns {Number}
 * @private
 */
function pdfMargin(r, m) {
	let inches = m;
	if (isNaN(m)) { inches = (isNaN(r.margin)) ? 0 : r.margin; }
	return TI.PDF.inchesToPixels(inches);
}
