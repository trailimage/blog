"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const yard = 3;
const mile = yard * 1760;
const equator = mile * 24901;
var utility_1 = require("@toba/utility");
exports.alphabet = utility_1.alphabet;
exports.month = utility_1.month;
exports.weekday = utility_1.weekday;
exports.header = utility_1.header;
exports.httpStatus = utility_1.httpStatus;
exports.mimeType = utility_1.mimeType;
exports.encoding = utility_1.encoding;
var MapDataType;
(function (MapDataType) {
    MapDataType[MapDataType["KMZ"] = 0] = "KMZ";
    MapDataType[MapDataType["KML"] = 1] = "KML";
    MapDataType[MapDataType["GeoJSON"] = 2] = "GeoJSON";
})(MapDataType = exports.MapDataType || (exports.MapDataType = {}));
exports.route = {
    CATEGORY: 'category',
    MONTH: 'month',
    PART_KEY: 'partKey',
    PHOTO_ID: 'photoID',
    PHOTO_TAG: 'tagSlug',
    POST_ID: 'postID',
    POST_KEY: 'postKey',
    ROOT_CATEGORY: 'rootCategory',
    SERIES_KEY: 'seriesKey',
    MAP_SOURCE: 'mapSource',
    YEAR: 'year'
};
exports.flickrSize = {
    THUMB: 'url_t',
    SQUARE_75: 'url_sq',
    SQUARE_150: 'url_q',
    SMALL_240: 'url_s',
    SMALL_320: 'url_n',
    MEDIUM_500: 'url_m',
    MEDIUM_640: 'url_z',
    MEDIUM_800: 'url_c',
    LARGE_1024: 'url_l',
    LARGE_1600: 'url_h',
    LARGE_2048: 'url_k',
    ORIGINAL: 'url_o'
};
exports.logTo = {
    REDIS: 'redis',
    CONSOLE: 'console',
    FILE: 'file'
};
exports.time = { SECOND: s, MINUTE: m, HOUR: h, DAY: d, WEEK: w };
exports.default = {
    distance: { EQUATOR: equator, MILE: mile, YARD: yard },
    time: exports.time,
    month,
    weekday,
    httpStatus,
    alphabet,
    logTo: exports.logTo,
    route: exports.route,
    encoding,
    flickrSize: exports.flickrSize,
    mimeType,
    header
};
//# sourceMappingURL=constants.js.map