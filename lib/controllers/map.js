"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const logger_1 = require("../logger");
const node_fetch_1 = require("node-fetch");
const config_1 = require("../config");
const geojson_1 = require("../map/geojson");
const template_1 = require("../template");
const library_1 = require("../library");
const _1 = require("../factory/");
const google_1 = require("../providers/google");
const compress = require("zlib");
const constants_1 = require("../constants");
let google = google_1.default;
function view(post, req, res) {
    if (is_1.default.value(post)) {
        const key = post.isPartial ? post.seriesKey : post.key;
        const photoID = req.params[constants_1.route.PHOTO_ID];
        res.render(template_1.default.page.MAP, {
            layout: template_1.default.layout.NONE,
            title: 'Map',
            post,
            key,
            photoID: is_1.default.numeric(photoID) ? photoID : 0,
            config: config_1.default
        });
    }
    else {
        res.notFound();
    }
}
function post(req, res) {
    view(library_1.default.postWithKey(req.params[constants_1.route.POST_KEY]), req, res);
}
function series(req, res) {
    view(library_1.default.postWithKey(req.params[constants_1.route.SERIES_KEY], req.params[constants_1.route.PART_KEY]), req, res);
}
function blog(req, res) {
    res.render(template_1.default.page.MAPBOX, {
        layout: template_1.default.layout.NONE,
        title: config_1.default.site.title + ' Map',
        config: config_1.default
    });
}
function blogJSON(req, res) {
    _1.default.map.forBlog()
        .then(item => { res.sendCompressed(constants_1.mimeType.JSON, item); })
        .catch(err => {
        logger_1.default.error(err);
        res.notFound();
    });
}
function postJSON(req, res) {
    _1.default.map.forPost(req.params[constants_1.route.POST_KEY])
        .then(item => { res.sendCompressed(constants_1.mimeType.JSON, item); })
        .catch(err => {
        logger_1.default.error(err);
        res.notFound();
    });
}
function mapSourceMines(req, res) {
    const opt = { headers: { 'User-Agent': 'node.js' } };
    node_fetch_1.default(config_1.default.map.source.mines, opt).then(kml => {
        if (kml.status == constants_1.httpStatus.OK) {
            kml.text()
                .then(geojson_1.default.featuresFromKML)
                .then(JSON.stringify)
                .then(geoText => {
                compress.gzip(Buffer.from(geoText), (err, buffer) => {
                    if (is_1.default.value(err)) {
                        res.internalError(err);
                    }
                    else {
                        res.setHeader(constants_1.header.content.ENCODING, constants_1.encoding.GZIP);
                        res.setHeader(constants_1.header.CACHE_CONTROL, 'max-age=86400, public');
                        res.setHeader(constants_1.header.content.TYPE, constants_1.mimeType.JSON + ';charset=utf-8');
                        res.setHeader(constants_1.header.content.DISPOSITION, `attachment; filename=mines.json`);
                        res.write(buffer);
                        res.end();
                    }
                });
            })
                .catch(err => {
                res.internalError(err);
            });
        }
        else {
            res.end(kml.status);
        }
    });
}
function gpx(req, res) {
    const post = config_1.default.map.allowDownload ? library_1.default.postWithKey(req.params[constants_1.route.POST_KEY]) : null;
    if (is_1.default.value(post)) {
        google.drive.loadGPX(post, res)
            .then(() => { res.end(); })
            .catch(res.notFound);
    }
    else {
        res.notFound();
    }
}
exports.default = {
    gpx,
    post,
    series,
    blog,
    json: {
        blog: blogJSON,
        post: postJSON
    },
    source: {
        mines: mapSourceMines
    },
    inject: {
        set google(g) { google = g; }
    }
};
//# sourceMappingURL=map.js.map