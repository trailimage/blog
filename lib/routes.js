"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const config_1 = require("./config");
const constants_1 = require("./constants");
const _1 = require("./controllers/");
const library_1 = require("./library");
const keepParams = { mergeParams: true };
function adminRoutes() {
    const r = Express.Router();
    r.get('/', _1.default.admin.home);
    r.post('/view/delete', _1.default.admin.cache.deleteView);
    r.post('/map/delete', _1.default.admin.cache.deleteMap);
    r.post('/json/delete', _1.default.admin.cache.deleteJSON);
    r.post('/library/reload', _1.default.admin.updateLibrary);
    return r;
}
function mapSourceRoutes() {
    const r = Express.Router(keepParams);
    r.get('/mines.json', _1.default.map.source.mines);
    return r;
}
function postRoutes(photoID) {
    const r = Express.Router(keepParams);
    r.get('/', _1.default.post.withKey);
    r.get('/map', _1.default.map.post);
    r.get('/gpx', _1.default.map.gpx);
    r.get(`/map/${photoID}`, _1.default.map.post);
    r.get('/geo.json', _1.default.map.json.post);
    return r;
}
function seriesRoutes(photoID) {
    const r = Express.Router(keepParams);
    r.get('/', _1.default.post.inSeries);
    r.get('/map', _1.default.map.series);
    r.get(`/map/${photoID}`, _1.default.map.series);
    return r;
}
function photoTagRoutes() {
    const r = Express.Router();
    r.get('/', _1.default.photo.tags);
    r.get(`/:${constants_1.route.PHOTO_TAG}`, _1.default.photo.tags);
    r.get(`/search/:${constants_1.route.PHOTO_TAG}`, _1.default.photo.withTag);
    return r;
}
function categoryRoutes() {
    const r = Express.Router(keepParams);
    r.get('/', _1.default.category.list);
    r.get(`/:${constants_1.route.CATEGORY}`, _1.default.category.forPath);
    return r;
}
function standard(app) {
    const s = '([\\w\\d-]{4,})';
    const photoID = `:${constants_1.route.PHOTO_ID}(\\d{10,11})`;
    const postID = `:${constants_1.route.POST_ID}(\\d{17})`;
    const postKey = `:${constants_1.route.POST_KEY}${s}`;
    const series = `:${constants_1.route.SERIES_KEY}${s}/:${constants_1.route.PART_KEY}${s}`;
    const rootCategory = ':' + constants_1.route.ROOT_CATEGORY + '(' + Object
        .keys(library_1.default.categories)
        .map(name => library_1.default.categories[name].key)
        .join('|') + ')';
    app.use('/admin', adminRoutes());
    for (const slug in config_1.default.redirects) {
        app.get('/' + slug, (req, res) => {
            res.redirect(constants_1.httpStatus.PERMANENT_REDIRECT, '/' + config_1.default.redirects[slug]);
        });
    }
    app.get('/', _1.default.category.home);
    app.get('/map', _1.default.map.blog);
    app.get('/geo.json', _1.default.map.json.blog);
    app.get('/rss', _1.default.rss);
    app.get('/about', _1.default.about);
    app.get('/js/post-menu-data.js', _1.default.menu.data);
    app.get('/sitemap.xml', _1.default.siteMap);
    app.get(`/exif/${photoID}`, _1.default.photo.exif);
    app.get('/issues?', _1.default.issues);
    app.get('/issues?/:slug' + s, _1.default.issues);
    app.get('/category-menu', _1.default.category.menu);
    app.get('/mobile-menu', _1.default.menu.mobile);
    app.get('/search', _1.default.search);
    app.use(`/${rootCategory}`, categoryRoutes());
    app.use('/photo-tag', photoTagRoutes());
    app.use('/map/source', mapSourceRoutes());
    app.get(`/${photoID}`, _1.default.post.withPhoto);
    app.get(`/${postID}`, _1.default.post.withID);
    app.get(`/${postID}/${photoID}`, _1.default.post.withID);
    app.use(`/${postKey}`, postRoutes(photoID));
    app.use(`/${series}`, seriesRoutes(photoID));
}
function authentication(app) {
    app.get('/auth/flickr', _1.default.auth.flickr);
    app.get('/auth/google', _1.default.auth.google);
    app.get('*', _1.default.auth.view);
}
exports.default = {
    standard,
    authentication
};
//# sourceMappingURL=routes.js.map