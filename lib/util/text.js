"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const regex_1 = require("../regex");
const url = require("url");
var utility_1 = require("@toba/utility");
exports.format = utility_1.format;
exports.capitalize = utility_1.capitalize;
exports.titleCase = utility_1.titleCase;
exports.slug = utility_1.slug;
exports.rot13 = utility_1.rot13;
exports.IPv6 = (ip) => (is_1.default.empty(ip) || ip === '::1') ? '127.0.0.1' : ip.replace(/^::[0123456789abcdef]{4}:/g, '');
exports.decodeBase64 = (text) => (new Buffer(text, 'base64')).toString();
exports.encodeBase64 = (text) => (new Buffer(text)).toString('base64');
exports.topDomain = (address) => {
    const parsed = url.parse(address.toLowerCase());
    const domain = (parsed.host !== null) ? parsed.host : parsed.path;
    const match = domain.match(regex_1.default.domain);
    return match ? match[0] : parsed.host;
};
//# sourceMappingURL=text.js.map