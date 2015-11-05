'use strict';

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
		var names = ['name', 'desc', 'author', 'copyright', 'link', 'time', 'keywords'];
		var properties = (extras) ? extras : {};

		for (let i = 0; i < names.length; i++) {
			let value = GPX.value(GPX.firstNode(node, names[i]));
			if (value) { properties[names[i]] = value; }
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
	 * @param {StrinG} tag
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