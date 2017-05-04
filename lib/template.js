"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./util/");
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
            formatCaption: _1.default.html.story,
            formatTitle: _1.default.html.typography,
            lowerCase: (text) => text.toLocaleLowerCase(),
            add: (a, b) => (a * 1) + b,
            date: _1.default.date.toString,
            subtract: (a, b) => (a * 1) - b,
            plural: (count) => (count > 1) ? 's' : '',
            makeTagList: _1.default.html.photoTagList,
            formatLogTime: _1.default.date.toLogTime,
            formatISO8601: (d) => d.toISOString(),
            formatFraction: _1.default.html.fraction,
            mapHeight: (width, height) => height > width ? config_1.default.style.map.maxInlineHeight : height,
            icon: _1.default.icon.tag,
            iconForCategory: _1.default.icon.category,
            modeIconForPost: _1.default.icon.mode,
            rot13: _1.default.encode.rot13,
            json: JSON.stringify,
            encode: encodeURIComponent
        };
        for (const name in helpers) {
            hbs.registerHelper(name, helpers[name]);
        }
    }
};
//# sourceMappingURL=template.js.map