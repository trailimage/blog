"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const map_1 = require("@toba/map");
const tools_1 = require("@toba/tools");
const models_1 = require("@trailimage/models");
const compress = require("zlib");
const config_1 = require("../config");
const routes_1 = require("../routes");
const views_1 = require("../views/");
const mapPath = 'map';
const gpxPath = 'gpx';
async function render(post, req, res) {
    if (!tools_1.is.value(post)) {
        return views_1.view.notFound(req, res);
    }
    const key = post.isPartial ? post.seriesKey : post.key;
    const photoID = req.params[routes_1.RouteParam.PhotoID];
    await post.getPhotos();
    res.render(views_1.Page.Mapbox, {
        layout: views_1.Layout.None,
        title: post.name() + ' Map',
        description: post.description,
        post,
        key,
        photoID: tools_1.is.numeric(photoID) ? photoID : 0,
        config: config_1.config
    });
}
function blogMap(_req, res) {
    res.render(views_1.Page.Mapbox, {
        layout: views_1.Layout.None,
        title: config_1.config.site.title + ' Map',
        config: config_1.config
    });
}
function post(req, res) {
    render(models_1.blog.postWithKey(req.params[routes_1.RouteParam.PostKey]), req, res);
}
function series(req, res) {
    render(models_1.blog.postWithKey(req.params[routes_1.RouteParam.SeriesKey], req.params[routes_1.RouteParam.PartKey]), req, res);
}
function photoJSON(_req, res) {
    views_1.view.sendJSON(res, mapPath, models_1.blog.geoJSON.bind(models_1.blog));
}
async function trackJSON(req, res) {
    const slug = req.params[routes_1.RouteParam.PostKey];
    const post = models_1.blog.postWithKey(slug);
    if (tools_1.is.value(post)) {
        views_1.view.sendJSON(res, `${slug}/${mapPath}`, post.geoJSON.bind(post));
    }
    else {
        views_1.view.notFound(req, res);
    }
}
async function source(req, res) {
    const key = req.params[routes_1.RouteParam.MapSource];
    if (!tools_1.is.text(key)) {
        return views_1.view.notFound(req, res);
    }
    const geo = await map_1.loadSource(key.replace('.json', ''));
    if (!tools_1.is.value(geo)) {
        return views_1.view.notFound(req, res);
    }
    const geoText = JSON.stringify(geo);
    try {
        compress.gzip(Buffer.from(geoText), (err, buffer) => {
            if (tools_1.is.value(err)) {
                views_1.view.internalError(res, err);
            }
            else {
                res.setHeader(tools_1.Header.Content.Encoding, tools_1.Encoding.GZip);
                res.setHeader(tools_1.Header.CacheControl, 'max-age=86400, public');
                res.setHeader(tools_1.Header.Content.Type, tools_1.addCharSet(tools_1.MimeType.JSON));
                res.setHeader(tools_1.Header.Content.Disposition, `attachment; filename=${key}`);
                res.write(buffer);
                res.end();
            }
        });
    }
    catch (err) {
        views_1.view.internalError(res, err);
    }
}
async function gpx(req, res) {
    const post = config_1.config.providers.map.allowDownload
        ? models_1.blog.postWithKey(req.params[routes_1.RouteParam.PostKey])
        : null;
    if (tools_1.is.value(post)) {
        const geo = await post.geoJSON();
    }
    else {
        views_1.view.notFound(req, res);
    }
}
exports.map = {
    gpx,
    post,
    series,
    source,
    blog: blogMap,
    json: {
        photo: photoJSON,
        post: trackJSON,
        blog: photoJSON
    }
};
