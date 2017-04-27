"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin_1 = require("./admin");
const auth_1 = require("./auth");
const category_1 = require("./category");
const map_1 = require("./map");
const menu_1 = require("./menu");
const photo_1 = require("./photo");
const post_1 = require("./post");
const rss_1 = require("./rss");
const static_1 = require("./static");
exports.default = {
    about: static_1.default.about,
    search: static_1.default.search,
    siteMap: static_1.default.siteMap,
    issues: static_1.default.issues,
    rss: rss_1.default,
    post: post_1.default,
    map: map_1.default,
    photo: photo_1.default,
    menu: menu_1.default,
    auth: auth_1.default,
    category: category_1.default,
    admin: admin_1.default
};
