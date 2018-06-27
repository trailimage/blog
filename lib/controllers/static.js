"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const models_1 = require("@trailimage/models");
const config_1 = require("../config");
const views_1 = require("../views/");
function search(req, res) {
    const term = req.query['q'];
    if (tools_1.is.value(term)) {
        res.render(views_1.Page.Search, {
            title: `Search for “${term}”`
        });
    }
    else {
        views_1.view.notFound(req, res);
    }
}
function about(_req, res) {
    views_1.view.send(res, views_1.Page.About, {
        title: 'About ' + config_1.config.site.title,
        jsonLD: models_1.owner()
    });
}
function siteMap(_req, res) {
    views_1.view.send(res, views_1.Page.Sitemap, {
        posts: models_1.blog.posts,
        layout: views_1.Layout.None,
        categories: models_1.blog.categoryKeys(),
        tags: models_1.blog.tags
    }, tools_1.MimeType.XML);
}
function issues(_req, res) {
    res.redirect(tools_1.HttpStatus.PermanentRedirect, 'http://issues.' + config_1.config.domain);
}
exports.staticPage = { issues, about, search, siteMap };
