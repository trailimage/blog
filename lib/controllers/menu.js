"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const template_1 = require("../template");
const library_1 = require("../library");
const constants_1 = require("../constants");
const uglify = require("uglify-js");
function data(_req, res) {
    const slug = template_1.page.POST_MENU_DATA;
    const postProcess = config_1.default.isProduction && !config_1.default.testing
        ? (text) => {
            const result = uglify.minify(text);
            return result.code;
        }
        : null;
    res.setHeader('Vary', 'Accept-Encoding');
    res.sendView(slug, {
        mimeType: constants_1.mimeType.JSONP,
        callback: render => {
            render(slug, { library: library_1.default, layout: template_1.layout.NONE }, postProcess);
        }
    });
}
function mobile(_req, res) {
    const slug = template_1.page.MOBILE_MENU_DATA;
    res.sendView(slug, {
        callback: render => {
            render(slug, { library: library_1.default, layout: template_1.layout.NONE });
        }
    });
}
exports.default = { data, mobile };
//# sourceMappingURL=menu.js.map