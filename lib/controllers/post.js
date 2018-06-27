"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const logger_1 = require("@toba/logger");
const models_1 = require("@trailimage/models");
const routes_1 = require("../routes");
const views_1 = require("../views/");
function send(req, res, key, viewName = views_1.Page.Post) {
    views_1.view.send(res, key, render => {
        const p = models_1.blog.postWithKey(key);
        if (!tools_1.is.value(p)) {
            views_1.view.notFound(req, res);
            return;
        }
        p.ensureLoaded()
            .then(() => {
            render(viewName, {
                post: p,
                title: p.title,
                jsonLD: p.jsonLD(),
                layout: views_1.Layout.None,
                description: p.longDescription,
                slug: key
            });
        })
            .catch(err => views_1.view.internalError(res, err));
    });
}
function inSeries(req, res) {
    send(req, res, req.params[routes_1.RouteParam.SeriesKey] + '/' + req.params[routes_1.RouteParam.PartKey]);
}
function withKey(req, res) {
    send(req, res, req.params[routes_1.RouteParam.PostKey]);
}
function withID(req, res) {
    const post = models_1.blog.postWithID(req.params[routes_1.RouteParam.PostID]);
    if (tools_1.is.value(post)) {
        res.redirect(tools_1.HttpStatus.PermanentRedirect, '/' + post.key);
    }
    else {
        views_1.view.notFound(req, res);
    }
}
function withPhoto(req, res) {
    const photoID = req.params[routes_1.RouteParam.PhotoID];
    models_1.blog
        .postWithPhoto(photoID)
        .then(post => {
        if (tools_1.is.value(post)) {
            res.redirect(tools_1.HttpStatus.PermanentRedirect, `/${post.key}#${photoID}`);
        }
        else {
            views_1.view.notFound(req, res);
        }
    })
        .catch(err => {
        logger_1.log.error(err, { photoID });
        views_1.view.notFound(req, res);
    });
}
function latest(req, res) {
    send(req, res, models_1.blog.posts[0].key);
}
exports.post = { latest, withID, withKey, withPhoto, inSeries };
