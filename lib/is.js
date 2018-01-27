"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("@toba/utility");
function cacheItem(o) {
    return (utility_1.is.value(o) && o['buffer'] !== undefined && o['eTag'] !== undefined);
}
exports.default = {
    type: utility_1.is.type,
    value: utility_1.is.value,
    defined: utility_1.is.defined,
    cacheItem,
    number: utility_1.is.number,
    numeric: utility_1.is.numeric,
    integer: utility_1.is.integer,
    bigInt: utility_1.is.bigInt,
    int64: utility_1.is.bigInt,
    date: utility_1.is.date,
    text: utility_1.is.text,
    empty: utility_1.is.empty,
    callable: utility_1.is.callable,
    array: utility_1.is.array,
    xml(v) { return this.text(v) && /^<\?xml version="[\d\.]+"/.test(v); }
};
//# sourceMappingURL=is.js.map