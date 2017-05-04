"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const config_1 = require("../config");
const _1 = require("../util/");
const template_1 = require("../template");
const library_1 = require("../library");
const constants_1 = require("../constants");
function exif(req, res) {
    library_1.default.getEXIF(req.params[constants_1.route.PHOTO_ID])
        .then(exif => {
        res.render(template_1.default.page.EXIF, { EXIF: exif, layout: template_1.default.layout.NONE });
    })
        .catch(res.notFound);
}
function withTag(req, res) {
    const slug = normalizeTag(decodeURIComponent(req.params[constants_1.route.PHOTO_TAG]));
    library_1.default.getPhotosWithTags(slug)
        .then(photos => {
        if (photos === null || photos.length == 0) {
            res.notFound();
        }
        else {
            const tag = library_1.default.tags[slug];
            const title = _1.default.number.say(photos.length) + ' &ldquo;' + tag + '&rdquo; Image' + ((photos.length != 1) ? 's' : '');
            res.render(template_1.default.page.PHOTO_SEARCH, {
                photos,
                config: config_1.default,
                title,
                layout: template_1.default.layout.NONE
            });
        }
    })
        .catch(res.notFound);
}
function tags(req, res) {
    let selected = normalizeTag(decodeURIComponent(req.params[constants_1.route.PHOTO_TAG]));
    const list = library_1.default.tags;
    const keys = Object.keys(list);
    const tags = {};
    if (is_1.default.empty(selected)) {
        selected = keys[Math.floor((Math.random() * keys.length) + 1)];
    }
    for (const c of constants_1.alphabet) {
        tags[c] = {};
    }
    for (const key in list) {
        const c = key.substr(0, 1).toLowerCase();
        if (constants_1.alphabet.indexOf(c) >= 0) {
            tags[c][key] = list[key];
        }
    }
    res.render(template_1.default.page.PHOTO_TAG, {
        tags,
        selected,
        alphabet: constants_1.alphabet,
        title: keys.length + ' Photo Tags',
        config: config_1.default
    });
}
function normalizeTag(slug) {
    if (is_1.default.value(slug)) {
        slug = slug.toLowerCase();
    }
    return (config_1.default.photoTagChanges[slug]) ? config_1.default.photoTagChanges[slug] : slug;
}
exports.default = { withTag, tags, exif };
//# sourceMappingURL=photo.js.map