"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const config_1 = require("../config");
const html_1 = require("./html");
exports.Layout = {
    Main: 'default-layout',
    None: null
};
var Page;
(function (Page) {
    Page["NotFound"] = "error/404";
    Page["InternalError"] = "error/500";
    Page["Error"] = "503";
    Page["About"] = "about";
    Page["Administration"] = "admin";
    Page["Authorize"] = "authorize";
    Page["EXIF"] = "exif";
    Page["CategoryMenu"] = "category-menu";
    Page["PostMenuData"] = "post-menu-data";
    Page["MobileMenuData"] = "mobile-menu-data";
    Page["Post"] = "post";
    Page["Category"] = "category";
    Page["CategoryList"] = "category-list";
    Page["PhotoTag"] = "photo-tag";
    Page["PhotoSearch"] = "photo-search";
    Page["Mapbox"] = "mapbox";
    Page["Search"] = "search";
    Page["Sitemap"] = "sitemap-xml";
})(Page = exports.Page || (exports.Page = {}));
function addTemplateMethods(ehb) {
    ehb.registerHelper({
        formatCaption: html_1.html.story,
        formatTitle: html_1.html.typography,
        lowerCase: (text) => text.toLocaleLowerCase(),
        add: (a, b) => a * 1 + b,
        date: tools_1.dateString,
        subtract: (a, b) => a * 1 - b,
        plural: (count) => (count > 1 ? 's' : ''),
        makeTagList: html_1.html.photoTagList,
        formatISO8601: (d) => d.toISOString(),
        formatFraction: html_1.html.fraction,
        mapHeight: (width, height) => height > width ? config_1.config.style.map.maxInlineHeight : height,
        icon: html_1.html.icon.tag,
        iconForCategory: html_1.html.icon.category,
        modeIconForPost: html_1.html.icon.mode,
        rot13: tools_1.rot13,
        json: JSON.stringify,
        encode: encodeURIComponent
    });
}
exports.addTemplateMethods = addTemplateMethods;
