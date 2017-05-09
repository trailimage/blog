"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const logger_1 = require("../logger");
const config_1 = require("../config");
const map_1 = require("./map");
const library_1 = require("../library");
const category_1 = require("./category");
const photo_size_1 = require("./photo-size");
const flickr_1 = require("../providers/flickr");
const post_1 = require("./post");
const exif_1 = require("./exif");
let flickr = flickr_1.default;
function buildLibrary(emptyIfLoaded = true) {
    const hadPostKeys = library_1.default.postKeys();
    if (emptyIfLoaded && library_1.default.loaded) {
        library_1.default.empty();
    }
    library_1.default.changedKeys = [];
    return Promise
        .all([flickr.getCollections(), flickr.getAllPhotoTags()])
        .then(([collections, tags]) => {
        library_1.default.tags = is_1.default.value(tags) ? parsePhotoTags(tags) : {};
        collections.forEach(c => category_1.default.make(c, true));
        correlatePosts();
        library_1.default.loaded = true;
        logger_1.default.infoIcon('photo_library', 'Loaded %d photo posts from Flickr: beginning detail retrieval', library_1.default.posts.length);
        Promise
            .all(library_1.default.posts.map(p => p.getInfo()))
            .then(() => {
            library_1.default.postInfoLoaded = true;
            logger_1.default.info('Finished loading post details');
        });
        return Promise.resolve();
    })
        .then(() => {
        library_1.default.getPostWithPhoto = getPostWithPhoto;
        library_1.default.getEXIF = getEXIF;
        library_1.default.getPhotosWithTags = getPhotosWithTags;
        library_1.default.load = buildLibrary;
        return Promise.resolve();
    })
        .then(() => {
        if (hadPostKeys.length > 0) {
            let changedKeys = [];
            library_1.default.posts
                .filter(p => hadPostKeys.indexOf(p.key) == -1)
                .forEach(p => {
                logger_1.default.info('Found new post "%s"', p.title);
                changedKeys = changedKeys.concat(Object.keys(p.categories));
                if (is_1.default.value(p.next)) {
                    changedKeys.push(p.next.key);
                }
                if (is_1.default.value(p.previous)) {
                    changedKeys.push(p.previous.key);
                }
            });
            library_1.default.changedKeys = changedKeys;
        }
        return library_1.default;
    });
}
function correlatePosts() {
    let p = library_1.default.posts[0];
    let parts = [];
    while (p != null && p.previous != null) {
        if (p.subTitle !== null) {
            parts.push(p);
            while (p.previous != null && p.previous.title == p.title) {
                p = p.previous;
                parts.unshift(p);
            }
            if (parts.length > 1) {
                parts[0].makeSeriesStart();
                for (let i = 0; i < parts.length; i++) {
                    parts[i].part = i + 1;
                    parts[i].totalParts = parts.length;
                    parts[i].isPartial = true;
                    if (i > 0) {
                        parts[i].previousIsPart = true;
                    }
                    if (i < parts.length - 1) {
                        parts[i].nextIsPart = true;
                    }
                }
            }
            else {
                p.ungroup();
            }
            parts = [];
        }
        p = p.previous;
    }
}
function getPostWithPhoto(photo) {
    const id = (typeof photo == is_1.default.type.STRING)
        ? photo
        : photo.id;
    return flickr.getPhotoContext(id).then(sets => (is_1.default.value(sets))
        ? this.posts.find(p => p.id == sets[0].id)
        : null);
}
function getEXIF(photoID) {
    return flickr.getExif(photoID).then(exif_1.default.make);
}
const getPhotosWithTags = (tags) => flickr.photoSearch(tags)
    .then(photos => photos.map(json => ({
    id: json.id,
    size: { thumb: photo_size_1.default.make(json, config_1.default.flickr.photoSize.search[0]) }
})));
function parsePhotoTags(rawTags) {
    const exclusions = is_1.default.array(config_1.default.flickr.excludeTags) ? config_1.default.flickr.excludeTags : [];
    return rawTags.reduce((tags, t) => {
        const text = t.raw[0]._content;
        if (text.indexOf('=') == -1 && exclusions.indexOf(text) == -1) {
            tags[t.clean] = text;
        }
        return tags;
    }, {});
}
exports.default = {
    buildLibrary,
    map: map_1.default,
    inject: {
        set flickr(f) {
            flickr = f;
            post_1.default.inject.flickr = f;
        },
        set google(g) {
            map_1.default.inject.google = g;
        }
    }
};
//# sourceMappingURL=index.js.map