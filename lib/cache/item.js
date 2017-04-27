"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const constants_1 = require("../constants");
const compress = require("zlib");
function create(key, htmlOrJSON) {
    return new Promise((resolve, reject) => {
        const text = (typeof (htmlOrJSON) == is_1.default.type.OBJECT) ? JSON.stringify(htmlOrJSON) : htmlOrJSON;
        compress.gzip(Buffer.from(text), (err, buffer) => {
            if (is_1.default.value(err)) {
                reject(err);
            }
            else {
                resolve({ buffer, eTag: key + '_' + (new Date()).getTime().toString() });
            }
        });
    });
}
exports.create = create;
exports.serialize = (item) => JSON.stringify({
    buffer: item.buffer.toString(constants_1.default.encoding.HEXADECIMAL),
    eTag: item.eTag
});
function deserialize(item) {
    return is_1.default.value(item)
        ? { buffer: Buffer.from(item.buffer, constants_1.default.encoding.HEXADECIMAL), eTag: item.eTag }
        : null;
}
exports.deserialize = deserialize;
exports.default = { create, serialize: exports.serialize, deserialize };
