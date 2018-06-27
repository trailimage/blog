"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const models_1 = require("@trailimage/models");
const logger_1 = require("@toba/logger");
const config_1 = require("../config");
const routes_1 = require("../routes");
const views_1 = require("../views/");
function exif(req, res) {
    const photoID = req.params[routes_1.RouteParam.PhotoID];
    models_1.blog
        .getEXIF(photoID)
        .then(exif => {
        res.render(views_1.Page.EXIF, {
            EXIF: exif,
            layout: views_1.Layout.None
        });
    })
        .catch(err => {
        logger_1.log.error(err, { photoID });
        views_1.view.notFound(req, res);
    });
}
function withTag(req, res) {
    const slug = tagParam(req);
    models_1.blog
        .getPhotosWithTags(slug)
        .then(photos => {
        if (photos === null || photos.length == 0) {
            views_1.view.notFound(req, res);
        }
        else {
            const tag = models_1.blog.tags.get(slug);
            const title = `${tools_1.sayNumber(photos.length)} &ldquo;${tag}&rdquo; Image${photos.length != 1 ? 's' : ''}`;
            res.render(views_1.Page.PhotoSearch, {
                photos,
                config: config_1.config,
                title,
                layout: views_1.Layout.None
            });
        }
    })
        .catch(err => {
        views_1.view.notFound(req, res);
        logger_1.log.error(err, { photoTag: slug });
    });
}
const tagParam = (req) => tools_1.is.defined(req.params, routes_1.RouteParam.PhotoTag)
    ? normalizeTag(decodeURIComponent(req.params[routes_1.RouteParam.PhotoTag]))
    : null;
function tags(req, res) {
    let slug = tagParam(req);
    const list = models_1.blog.tags;
    const keys = Array.from(list.keys());
    const tags = {};
    if (tools_1.is.empty(slug)) {
        slug = keys[Math.floor(Math.random() * keys.length + 1)];
    }
    for (const c of tools_1.alphabet) {
        tags[c] = {};
    }
    for (const [key, value] of list.entries()) {
        const c = (key.toString()).substr(0, 1).toLowerCase();
        if (tools_1.alphabet.indexOf(c) >= 0) {
            tags[c][key] = value;
        }
    }
    res.render(views_1.Page.PhotoTag, {
        tags,
        selected: slug,
        alphabet: tools_1.alphabet,
        title: keys.length + ' Photo Tags',
        config: config_1.config
    });
}
function normalizeTag(slug) {
    if (tools_1.is.value(slug)) {
        slug = slug.toLowerCase();
    }
    else {
        return null;
    }
    return tools_1.is.defined(config_1.config.photoTagChanges, slug)
        ? config_1.config.photoTagChanges[slug]
        : slug;
}
exports.normalizeTag = normalizeTag;
exports.photo = { withTag, tags, exif };
