"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("@toba/utility");
function cacheItem(o) {
    return (utility_1.is.value(o) &&
        o['buffer'] !== undefined &&
        o['eTag'] !== undefined);
}
exports.default = Object.assign({}, utility_1.is, { cacheItem,
    xml(v) {
        return this.text(v) && /^<\?xml version="[\d\.]+"/.test(v);
    } });
//# sourceMappingURL=is.js.map