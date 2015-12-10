'use strict';

const is = require('../').is;

/**
 * GPX helper methods
 */
class GPX {
	/**
	 * Properties of a GPX node
	 * @param {Node} node
	 * @param {Object} [extras] Object literal of additional properties to set
	 * @returns {Object}
	 */
	static properties(node, extras) {
		let names = ['name', 'desc', 'author', 'copyright', 'link', 'time', 'keywords'];
		let properties = (extras === undefined) ? {} : extras;

		for (let name of names) {
			let value = GPX.firstValue(node, name);
			if (!is.empty(value)) { properties[name] = value; }
		}

		return properties;
	}

	/**
	 * Node content
	 * @param {Node} node
	 * @returns {string}
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
	 */
	static value(node) {
		if (node && node.normalize) { node.normalize(); }
		return node && node.firstChild && node.firstChild.nodeValue;
	}

	/**
	 * @param {Node} node
	 * @param {String} tag
	 * @returns {string}
	 */
	static firstValue(node, tag) {
		return GPX.value(GPX.firstNode(node, tag));
	}

	/**
	 * First child or null
	 * @param {Document|Node} node
	 * @param {String} tag
	 * @returns {Node}
	 */
	static firstNode(node, tag) {
		var n = node.getElementsByTagName(tag);
		return n.length ? n[0] : null;
	}

	/**
	 * @param {Node|Element} dom
	 * @param {String} name
	 * @returns {Number}
	 */
	static numberAttribute(dom, name) { return parseFloat(dom.getAttribute(name)); }
}

module.exports = GPX;