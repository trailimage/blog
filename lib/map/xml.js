const is = require('../is');

/**
 * Node content
 * @param {Node} node
 * @returns {string}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
 */
function value(node) {
   if (is.value(node) && node.normalize) { node.normalize(); }
   return node && node.firstChild && node.firstChild.nodeValue;
}

/**
 * @param {Node} node
 * @param {string} tag
 * @returns {string}
 */
function firstValue(node, tag) { return this.value(this.firstNode(node, tag)); }

/**
 * First child or null
 * @param {Document|Node} node
 * @param {string} tag
 * @returns {Node}
 */
function firstNode(node, tag) {
   var n = node.getElementsByTagName(tag);
   return (is.value(n) && n.length > 0) ? n[0] : null;
}

/**
 * @param {Node|Element} dom
 * @param {string} name
 * @returns {Number}
 */
const numberAttribute = (dom, name) => parseFloat(dom.getAttribute(name));

module.exports = {
   value,
   firstValue,
   firstNode,
   numberAttribute
};