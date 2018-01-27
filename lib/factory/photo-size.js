"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
function make(json, sizeField) {
    const size = {
        url: null,
        width: 0,
        height: 0,
        get isEmpty() {
            return this.url === null && this.width === 0;
        }
    };
    let field = null;
    if (is_1.default.array(sizeField)) {
        for (field of sizeField) {
            if (!is_1.default.empty(json[field])) {
                break;
            }
        }
    }
    else {
        field = sizeField;
    }
    if (field !== null) {
        const suffix = field.replace('url', '');
        if (!is_1.default.empty(json[field])) {
            size.url = json[field];
            size.width = parseInt(json['width' + suffix]);
            size.height = parseInt(json['height' + suffix]);
        }
    }
    return size;
}
exports.default = { make };
//# sourceMappingURL=photo-size.js.map