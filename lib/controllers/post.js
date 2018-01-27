"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const json_ld_1 = require("../json-ld");
const template_1 = require("../template");
const library_1 = require("../library");
const constants_1 = require("../constants");
function view(res, key, pageTemplate = template_1.default.page.POST) {
    res.sendView(key, {
        callback: render => {
            const p = library_1.default.postWithKey(key);
            if (!is_1.default.value(p)) {
                res.notFound();
                return;
            }
            p
                .ensureLoaded()
                .then(() => {
                render(pageTemplate, {
                    post: p,
                    title: p.title,
                    jsonLD: json_ld_1.default.serialize(json_ld_1.default.fromPost(p)),
                    description: p.longDescription,
                    slug: key,
                    layout: template_1.default.layout.NONE
                });
            })
                .catch(res.internalError);
        }
    });
}
function inSeries(req, res) {
    view(res, req.params[constants_1.route.SERIES_KEY] + '/' + req.params[constants_1.route.PART_KEY]);
}
function withKey(req, res) {
    view(res, req.params[constants_1.route.POST_KEY]);
}
function withID(req, res) {
    const post = library_1.default.postWithID(req.params[constants_1.route.POST_ID]);
    if (is_1.default.value(post)) {
        res.redirect(constants_1.httpStatus.PERMANENT_REDIRECT, '/' + post.key);
    }
    else {
        res.notFound();
    }
}
function withPhoto(req, res) {
    const photoID = req.params[constants_1.route.PHOTO_ID];
    library_1.default
        .getPostWithPhoto(photoID)
        .then(post => {
        if (is_1.default.value(post)) {
            res.redirect(constants_1.httpStatus.PERMANENT_REDIRECT, '/' + post.key + '#' + photoID);
        }
        else {
            res.notFound();
        }
    })
        .catch(res.notFound);
}
function latest(_req, res) {
    view(res, library_1.default.posts[0].key);
}
exports.default = { latest, withID, withKey, withPhoto, inSeries };
//# sourceMappingURL=post.js.map