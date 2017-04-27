"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regex_1 = require("../regex");
function make(setInfo) {
    const d = setInfo.description._content;
    if (regex_1.default.video.test(d)) {
        const match = regex_1.default.video.exec(d);
        setInfo.description._content = d.replace(match[0], '');
        return {
            id: match[4],
            width: parseInt(match[2]),
            height: parseInt(match[3]),
            get empty() { return this.width === 0 || this.height === 0; }
        };
    }
    else {
        return null;
    }
}
exports.default = { make };
