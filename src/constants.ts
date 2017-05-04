const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const yard = 3;
const mile = yard * 1760;
const equator = mile * 24901;

export const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
export const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const header = {
   ACCEPT: 'Accept',
   accept: {
      ENCODING: 'accept-encoding',
      LANGUAGE: 'accept-language'
   },
   accessControl: {
      MAX_AGE: 'Access-Control-Max-Age',
      allow: {
         CREDENTIALS: 'Access-Control-Allow-Credentials',
         HEADERS: 'Access-Control-Allow-Headers',
         METHODS: 'Access-Control-Allow-Methods',
         ORIGIN: 'Access-Control-Allow-Origin'
      },
      request: {
         HEADERS: 'Access-Control-Request-Headers',
         METHOD: 'Access-Control-Request-Method'
      }
   },
   CACHE_CONTROL: 'Cache-Control',
   CONNECTION: 'connection',
   content: {
      DISPOSITION: 'Content-Disposition',
      ENCODING: 'Content-Encoding',
      LENGTH: 'Content-Length',
      TYPE: 'Content-Type'
   },
   DO_NOT_TRACK: 'dnt',
   E_TAG: 'Etag',
   EXPIRES: 'expires',
   HOST: 'host',
   HTTP_METHOD: 'X-HTTP-Method-Override',
   LAST_MODIFIED: 'Last-Modified',
   ORIGIN: 'origin',
   PRAGMA: 'pragma',
   REFERER: 'referer',
   RESPONSE_TIME: 'X-Response-Time',
   REQUESTED_WITH: 'X-Requested-With',
   USER_AGENT: 'user-agent'
};

export enum MapDataType { KMZ, KML, GeoJSON }

export const httpStatus = {
   OK: 200,
   TEMP_REDIRECT: 301,
   PERMANENT_REDIRECT: 302,
   UNAUTHORIZED: 401,
   FORBIDDEN: 403,
   NOT_FOUND: 404,
   INTERNAL_ERROR: 500,
   UNSUPPORTED: 501,
   BAD_GATEWAY: 502,
   UNAVAILABLE: 503
};
// http://www.sitepoint.com/web-foundations/mime-types-complete-list/
export const mimeType = {
   HTML: 'text/html',
   JSON: 'application/json',
   XML: 'text/xml',
   GPX: 'application/gpx+xml',
   JSONP: 'application/javascript',
   JPEG: 'image/jpeg',
   PNG: 'image/png',
   TEXT: 'text/plain',
   ZIP: 'application/zip'
};
export const encoding = {
   BUFFER: 'buffer',
   GZIP: 'gzip',
   HEXADECIMAL: 'hex',
   UTF8: 'utf8'
};
/**
 * Route placeholders that become req.params values
 */
export const route = {
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

export const flickrSize = {
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

/**
 * Provider names used internally by Winston
 */
export const logTo = {
   REDIS: 'redis',
   CONSOLE: 'console',
   FILE: 'file'
};

/**
 * Durations of time in milliseconds
 */
export const time = { SECOND: s, MINUTE: m, HOUR: h, DAY: d, WEEK: w };

export default {
   // distances in terms of feet
   distance: { EQUATOR: equator, MILE: mile, YARD: yard },
   time,
   month,
   weekday,
   httpStatus,
   alphabet,
   logTo,
   route,
   encoding,
   flickrSize,
   mimeType,
   header
};