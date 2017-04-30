"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const config_1 = require("./config");
exports.layout = {
    MAIN: 'layouts/default-layout',
    NONE: null
};
exports.page = {
    NOT_FOUND: 'error/404',
    INTERNAL_ERROR: 'error/500',
    ERROR: '503',
    ABOUT: 'about',
    ADMINISTRATION: 'admin',
    AUTHORIZE: 'authorize',
    EXIF: 'exif',
    CATEGORY_MENU: 'category-menu',
    POST_MENU_DATA: 'post-menu-data',
    MOBILE_MENU_DATA: 'mobile-menu-data',
    POST: 'post',
    CATEGORY: 'category',
    CATEGORY_LIST: 'category-list',
    PHOTO_TAG: 'photo-tag',
    PHOTO_SEARCH: 'photo-search',
    MAP: 'map',
    MAPBOX: 'mapbox',
    SEARCH: 'search',
    SITEMAP: 'sitemap-xml'
};
exports.default = {
    layout: exports.layout,
    page: exports.page,
    assignHelpers: function (hbs) {
        const helpers = {
            formatCaption: util_1.default.html.story,
            formatTitle: util_1.default.html.typography,
            lowerCase: (text) => text.toLocaleLowerCase(),
            add: (a, b) => (a * 1) + b,
            date: util_1.default.date.toString,
            subtract: (a, b) => (a * 1) - b,
            plural: (count) => (count > 1) ? 's' : '',
            makeTagList: util_1.default.html.photoTagList,
            formatLogTime: util_1.default.date.toLogTime,
            formatISO8601: (d) => d.toISOString(),
            formatFraction: util_1.default.html.fraction,
            mapHeight: (width, height) => height > width ? config_1.default.style.map.maxInlineHeight : height,
            icon: util_1.default.icon.tag,
            iconForCategory: util_1.default.icon.category,
            modeIconForPost: util_1.default.icon.mode,
            rot13: util_1.default.encode.rot13,
            encode: encodeURIComponent
        };
        for (const name in helpers) {
            hbs.registerHelper(name, helpers[name]);
        }
    }
};
//# sourceMappingURL=template.js.map