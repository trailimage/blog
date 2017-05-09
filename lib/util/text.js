"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const regex_1 = require("../regex");
const url = require("url");
const alwaysLower = ['a', 'at', 'how', 'have', 'in', 'not', 'of', 'on', 'the', 'to', 'when', 'who'];
const alwaysUpper = ['blm', 'fs', 'i'];
function format(text, ...insertions) {
    for (let i = 0; i < insertions.length; i++) {
        text = text.replace('{' + i + '}', insertions[i]);
    }
    return text;
}
exports.format = format;
exports.capitalize = (text) => is_1.default.empty(text) ? '' : text.substr(0, 1).toUpperCase() + text.substr(1).toLowerCase();
exports.titleCase = (text) => is_1.default.empty(text) ? '' : text
    .replace(/(^|\s)([a-zA-z]+('[a-zA-Z]{1,2})?)(\b|$)/g, (match, before, word, apostrophe, after, index) => {
    return before + word.toLocaleLowerCase();
})
    .replace(/\b[a-z]+('[a-z]{1,2})?/g, (match, apostrophe, index) => {
    let word = match;
    if (alwaysUpper.indexOf(word) >= 0) {
        word = word.toLocaleUpperCase();
    }
    else if (index == 0 || alwaysLower.indexOf(word) == -1) {
        word = word.substr(0, 1).toUpperCase() + word.substr(1);
    }
    return word;
})
    .replace(/\b[a-z]$/, match => match.toLocaleUpperCase());
exports.slug = (text) => is_1.default.empty(text)
    ? null
    : text
        .toLowerCase()
        .replace(/[\s\/-]+/g, '-')
        .replace('à', 'a')
        .replace(/[^\-a-z0-9]/g, '');
exports.IPv6 = (ip) => (is_1.default.empty(ip) || ip === '::1') ? '127.0.0.1' : ip.replace(/^::[0123456789abcdef]{4}:/g, '');
exports.decodeBase64 = (text) => (new Buffer(text, 'base64')).toString();
exports.encodeBase64 = (text) => (new Buffer(text)).toString('base64');
exports.rot13 = (text) => is_1.default.empty(text) ? null : text.replace(/[a-zA-Z]/g, chr => {
    const start = chr <= 'Z' ? 65 : 97;
    return String.fromCharCode(start + (chr.charCodeAt(0) - start + 13) % 26);
});
exports.topDomain = (address) => {
    const parsed = url.parse(address.toLowerCase());
    const domain = (parsed.host !== null) ? parsed.host : parsed.path;
    const match = domain.match(regex_1.default.domain);
    return match ? match[0] : parsed.host;
};
//# sourceMappingURL=text.js.map