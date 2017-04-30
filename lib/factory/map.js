"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const config_1 = require("../config");
const library_1 = require("../library");
const geojson_1 = require("../map/geojson");
const cache_1 = require("../cache");
const google_1 = require("../providers/google");
const BLOG_JSON_KEY = 'blog-map';
let google = google_1.default;
const forPost = (postKey) => config_1.default.cache.maps
    ? cache_1.default.map.getItem(postKey).then(item => is_1.default.cacheItem(item) ? item : loadForPost(postKey))
    : loadForPost(postKey);
const forBlog = () => config_1.default.cache.maps
    ? cache_1.default.map.getItem(BLOG_JSON_KEY).then(item => is_1.default.cacheItem(item) ? item : loadMap())
    : loadMap();
const loadMap = () => Promise.resolve(geojson_1.default.features())
    .then(geo => mapPhotoFeatures(geo))
    .then(geo => cache_1.default.map.add(BLOG_JSON_KEY, geo));
function loadForPost(postKey) {
    const post = library_1.default.postWithKey(postKey);
    if (!is_1.default.value(post)) {
        throw new ReferenceError(`Post ${postKey} not found in library`);
    }
    const noGPX = Promise.resolve(geojson_1.default.features());
    const getFeatures = (post.triedTrack && !post.hasTrack)
        ? noGPX
        : google.drive.loadGPX(post)
            .then(geojson_1.default.featuresFromGPX)
            .catch(() => noGPX);
    return getFeatures
        .then(geo => mapPostPhotoFeatures(post, geo))
        .then(geo => cache_1.default.map.add(postKey, geo));
}
const mapPhotoFeatures = (geo) => new Promise(resolve => { addPhotoFeatures(geo, resolve); });
const mapPostPhotoFeatures = (post, geo) => new Promise(resolve => {
    if (post.isPartial) {
        while (!post.isSeriesStart) {
            post = post.previous;
        }
    }
    addPostPhotoFeatures(post, geo, resolve);
});
function addPostPhotoFeatures(post, geo, resolve) {
    post.getPhotos().then(photos => {
        const partKey = post.isPartial ? post.key : null;
        geo.features = geo.features.concat(photos
            .filter(p => p.latitude > 0)
            .map(p => geojson_1.default.pointFromPhoto(p, partKey)));
        if (post.nextIsPart) {
            addPostPhotoFeatures(post.next, geo, resolve);
        }
        else {
            resolve(geo);
        }
    });
}
function addPhotoFeatures(geo, resolve) {
    library_1.default.getPhotos().then(photos => {
        geo.features = geo.features.concat(photos
            .filter(p => p.latitude > 0)
            .map(p => geojson_1.default.pointFromPhoto(p)));
        resolve(geo);
    });
}
exports.default = {
    forPost,
    forBlog,
    inject: {
        set google(g) { google = g; }
    }
};
//# sourceMappingURL=map.js.map