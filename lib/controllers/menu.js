"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const models_1 = require("@trailimage/models");
const config_1 = require("../config");
const views_1 = require("../views/");
function data(_req, res) {
    const minify = config_1.config.isProduction && !config_1.config.testing;
    res.setHeader(tools_1.Header.Vary, tools_1.Header.Accept.Encoding);
    views_1.view.send(res, views_1.Page.PostMenuData, { blog: models_1.blog, layout: views_1.Layout.None }, tools_1.MimeType.JSONP, minify);
}
exports.data = data;
function mobile(_req, res) {
    views_1.view.send(res, views_1.Page.MobileMenuData, { blog: models_1.blog, layout: views_1.Layout.None });
}
exports.mobile = mobile;
exports.menu = { mobile, data };
