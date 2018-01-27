"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("@toba/utility");
const yard = 3;
const mile = yard * 1760;
const equator = mile * 24901;
var utility_2 = require("@toba/utility");
exports.month = utility_2.month;
exports.weekday = utility_2.weekday;
exports.header = utility_2.header;
exports.httpStatus = utility_2.httpStatus;
exports.mimeType = utility_2.mimeType;
exports.encoding = utility_2.encoding;
exports.alphabet = utility_2.alphabet;
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
exports.time = {
    SECOND: utility_1.Time.Second,
    MINUTE: utility_1.Time.Minute,
    HOUR: utility_1.Time.Hour,
    DAY: utility_1.Time.Day,
    WEEK: utility_1.Time.Week
};
exports.default = {
    distance: { EQUATOR: equator, MILE: mile, YARD: yard },
    time: exports.time,
    month: utility_1.month,
    weekday: utility_1.weekday,
    httpStatus: utility_1.httpStatus,
    alphabet: utility_1.alphabet,
    logTo: exports.logTo,
    route: exports.route,
    encoding: utility_1.encoding,
    flickrSize: exports.flickrSize,
    mimeType: utility_1.mimeType,
    header: utility_1.header
};
//# sourceMappingURL=constants.js.map