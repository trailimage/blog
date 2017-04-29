"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
function value(node) {
    if (is_1.default.value(node) && node.normalize) {
        node.normalize();
    }
    return node && node.firstChild && node.firstChild.nodeValue;
}
function firstValue(node, tag) {
    return value(firstNode(node, tag));
}
function firstNode(node, tag) {
    const n = node.getElementsByTagName(tag);
    return (is_1.default.value(n) && n.length > 0) ? n[0] : null;
}
const numberAttribute = (dom, name) => parseFloat(dom.getAttribute(name));
exports.default = { value, firstValue, firstNode, numberAttribute };
