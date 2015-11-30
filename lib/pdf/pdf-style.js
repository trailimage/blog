'use strict';

const is = require('../is.js');
const extend = require('extend');
const Page = require('./pages/pdf-page.js');
const Element = require('./elements/pdf-element.js');
const PDFDocument = require('pdfkit');

/**
 * Parse pdf-style.json
 */
class PDFStyle {
	constructor() {
		/**
		 * @type {PDFStyleConfig}
		 */
		const style = require('../../pdf-style.json');
		/**
		 * @type {PDFStyleSettings}
		 */
		this.settings = extend({}, style.settings);
		/**
		 * @type {PDFStyleRuleList}
		 */
		this.rules = extend({}, style.rules);

		// replace color aliases with RGB values (pdfkit handles font aliases)
		for (let name in this.rules) {
			let rule = this._inherit(this.rules[name]);
			this._expandColors(rule, 'color');
			this._expandColors(rule, 'backgroundColor');
			this.rules[name] = rule;
		}
	}

	/**
	 * Create PDF to match style
	 * Assumes existence of a defaultPage style rule
	 * @param {String} title
	 * @param {String} author
	 * @return {PDFDocument}
	 * @see http://pdfkit.org/docs/getting_started.html
	 */
	preparePDF(title, author) {
		let options = this.pdfConfig('defaultPage');
		options.info = { Title: title, Author: author };
		let pdf = new PDFDocument(options);
		// register fonts with document
		for (let f in this.settings.fonts) { pdf.registerFont(f, this.settings.fonts[f]); }
		return pdf;
	}

	/**
	 * Apply style to element
	 * @param {PDFDocument} pdf
	 * @param {PDFElement|PDFPage|ElementGroup} el
	 * @return {PDFDocument}
	 */
	addPageTo(pdf, el) {
		return pdf.addPage(this.pdfConfig(el.styleName))
	}

	pdfConfig(styleName) {
		/** @type {PDFStyleRule} */
		let rule = this.rules[styleName];
		let w = Element.inchesToPixels(rule.width);
		let h = Element.inchesToPixels(rule.height);

		return {
			size: (w > h) ? [h, w] : [w, h],
			layout: (w > h) ? Page.Layout.Landscape : Page.Layout.Portrait,
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
	 * @param {PDFElement|PDFPage|ElementGroup} el
	 */
	applyTo(el) {
		let rules = this.rules[el.styleName];

		if (rules !== undefined) {
			for (let r in rules) {
				switch (r) {
					case "margin": break; el.allMargins = rules[r]; break;
					case "marginBottom": el.margin.bottom = rules[r]; break;
					case "marginLeft": el.margin.left = rules[r]; break;
					case "marginRight": el.margin.right = rules[r]; break;
					case "marginTop": el.margin.top = rules[r]; break;
					case "scale": el.scaleTo = rules[r]; break;
					// rules that directly match element properties:
					case "alignContent":
					case "backgroundColor":
					case "bottom":
					case "color":
					case "font":
					case "fontSize":
					case "height":
					case "minWidth":
					case "top":
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

module.exports = PDFStyle;

// - Private static members ---------------------------------------------------

/**
 * @param {PDFStyleRule} r
 * @param {Number} m
 * @return {Number}
 * @private
 */
function pdfMargin(r, m) {
	let inches = m;
	if (isNaN(m)) { inches = (isNaN(r.margin)) ? 0 : r.margin; }
	return Element.inchesToPixels(inches);
}
