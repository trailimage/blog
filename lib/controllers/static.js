"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const json_ld_1 = require("../json-ld");
const config_1 = require("../config");
const template_1 = require("../template");
const library_1 = require("../library");
const constants_1 = require("../constants");
function search(req, res) {
    const term = req.query['q'];
    if (is_1.default.value(term)) {
        res.render(template_1.page.SEARCH, {
            title: 'Search for “' + req.query['q'] + '”',
            config: config_1.default
        });
    }
    else {
        res.notFound();
    }
}
function about(req, res) {
    res.sendView(template_1.page.ABOUT, {
        templateValues: {
            title: 'About ' + config_1.default.site.title,
            jsonLD: json_ld_1.default.serialize(json_ld_1.default.owner)
        }
    });
}
function siteMap(req, res) {
    res.sendView(template_1.page.SITEMAP, {
        mimeType: constants_1.mimeType.XML,
        callback: render => {
            render(template_1.page.SITEMAP, {
                posts: library_1.default.posts,
                categories: library_1.default.categoryKeys(),
                tags: library_1.default.tags,
                layout: null
            });
        }
    });
}
function issues(req, res) {
    res.redirect(constants_1.httpStatus.PERMANENT_REDIRECT, 'http://issues.' + config_1.default.domain);
}
exports.default = { search, about, siteMap, issues };
