"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const models_1 = require("@trailimage/models");
const Express = require("express");
const config_1 = require("./config");
const index_1 = require("./controllers/index");
var RouteParam;
(function (RouteParam) {
    RouteParam["Category"] = "category";
    RouteParam["Month"] = "month";
    RouteParam["PartKey"] = "partKey";
    RouteParam["PhotoID"] = "photoID";
    RouteParam["PhotoTag"] = "tagSlug";
    RouteParam["PostID"] = "postID";
    RouteParam["PostKey"] = "postKey";
    RouteParam["RootCategory"] = "rootCategory";
    RouteParam["SeriesKey"] = "seriesKey";
    RouteParam["MapSource"] = "mapSource";
    RouteParam["Year"] = "year";
})(RouteParam = exports.RouteParam || (exports.RouteParam = {}));
const keepParams = { mergeParams: true };
function postRoutes(photoID) {
    const r = Express.Router(keepParams);
    r.get('/', index_1.post.withKey);
    r.get('/map', index_1.map.post);
    r.get('/gpx', index_1.map.gpx);
    r.get(`/map/${photoID}`, index_1.map.post);
    r.get('/geo.json', index_1.map.json.post);
    return r;
}
function seriesRoutes(photoID) {
    const r = Express.Router(keepParams);
    r.get('/', index_1.post.inSeries);
    r.get('/map', index_1.map.series);
    r.get(`/map/${photoID}`, index_1.map.series);
    return r;
}
function photoTagRoutes() {
    const r = Express.Router();
    r.get('/', index_1.photo.tags);
    r.get(`/:${RouteParam.PhotoTag}`, index_1.photo.tags);
    r.get(`/search/:${RouteParam.PhotoTag}`, index_1.photo.withTag);
    return r;
}
function categoryRoutes() {
    const r = Express.Router(keepParams);
    r.get('/', index_1.category.list);
    r.get(`/:${RouteParam.Category}`, index_1.category.forPath);
    return r;
}
function standard(app) {
    const s = '([\\w\\d-]{4,})';
    const photoID = `:${RouteParam.PhotoID}(\\d{10,11})`;
    const postID = `:${RouteParam.PostID}(\\d{17})`;
    const postKey = `:${RouteParam.PostKey}${s}`;
    const series = `:${RouteParam.SeriesKey}${s}/:${RouteParam.PartKey}${s}`;
    const rootCategory = `:${RouteParam.RootCategory}(${Array.from(models_1.blog.categories.values())
        .map(c => c.key)
        .join('|')})`;
    for (const slug in config_1.config.redirects) {
        app.get('/' + slug, (_req, res) => {
            res.redirect(tools_1.HttpStatus.PermanentRedirect, '/' + config_1.config.redirects[slug]);
        });
    }
    app.get('/', index_1.category.home);
    app.get('/map', index_1.map.blog);
    app.get(`/map/source/:${RouteParam.MapSource}([a-z\-]+\.json$)`, index_1.map.source);
    app.get('/geo.json', index_1.map.json.blog);
    app.get('/rss', index_1.postFeed);
    app.get('/about', index_1.staticPage.about);
    app.get('/js/post-menu-data.js', index_1.menu.data);
    app.get('/sitemap.xml', index_1.staticPage.siteMap);
    app.get(`/exif/${photoID}`, index_1.photo.exif);
    app.get('/issues?', index_1.staticPage.issues);
    app.get('/issues?/:slug' + s, index_1.staticPage.issues);
    app.get('/category-menu', index_1.category.menu);
    app.get('/mobile-menu', index_1.menu.mobile);
    app.get('/search', index_1.staticPage.search);
    app.use(`/${rootCategory}`, categoryRoutes());
    app.use('/photo-tag', photoTagRoutes());
    app.get(`/${photoID}`, index_1.post.withPhoto);
    app.get(`/${postID}`, index_1.post.withID);
    app.get(`/${postID}/${photoID}`, index_1.post.withID);
    app.use(`/${postKey}`, postRoutes(photoID));
    app.use(`/${series}`, seriesRoutes(photoID));
}
function authentication(app) {
    app.get('/auth/flickr', index_1.auth.post);
    app.get('/auth/google', index_1.auth.map);
    app.get('*', index_1.auth.main);
}
exports.route = {
    standard,
    authentication
};
