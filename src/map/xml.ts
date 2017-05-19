import is from '../is';

/**
 * Node content.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
 */
function value(node:Element|Node):string {
   if (is.value(node) && node.normalize) { node.normalize(); }
   return node && node.firstChild && node.firstChild.nodeValue;
}

function firstValue(node:Element, tag:string):string {
   return value(firstNode(node, tag));
}

/**
 * First child or null.
 */
function firstNode(node:Element, tag:string):Element {
   const n = node.getElementsByTagName(tag);
   return (is.value(n) && n.length > 0) ? n[0] : null;
}

const numberAttribute = (dom:Element, name:string) => parseFloat(dom.getAttribute(name));

export default { value, firstValue, firstNode, numberAttribute };