'use strict';

/** @type {int} */
const s = 1000;
/** @type {int} */
const m = s * 60;
/** @type {int} */
const h = m * 60;
/** @type {int} */
const d = h * 24;
/** @type {int} */
const w = d * 7;
/** @type {int} */
const yard = 3;
/** @type {int} */
const mile = yard * 1760;
/** @type {int} */
const equator = mile * 24901;

/**
 * Distances in terms of feet
 * @enum {Number}
 * @const
 */
exports.distance = { equator: equator, mile: mile, yard: yard };

/**
 * Durations in terms of milliseconds
 * @enum {Number}
 * @const
 */
exports.time = { second: s, minute: m, hour: h, day: d, week: w };

/**
 * @type {String[]}
 * @const
 * @static
 */
exports.month = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/**
 * @type {String[]}
 * @const
 * @static
 */
exports.weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/**
 * @enum {Number}
 * @const
 * @static
 */
exports.httpStatus = {
	ok: 200,
	temporaryRedirect: 301,
	permanentRedirect: 302,
	forbidden: 403,
	notFound: 404,
	internalError: 500,
	unsupported: 501,
	badGateway: 502,
	unavailable: 503
};

/**
 * @enum {String}
 * @const
 * @static
 * @see http://www.sitepoint.com/web-foundations/mime-types-complete-list/
 */
exports.mimeType = {
	html: 'text/html',
	json: 'application/json',
	jsonp: 'application/javascript',
	jpeg: 'image/jpeg',
	png: 'image/png',
	text: 'text/plain',
	zip: 'application/zip'
};

/**
 * @enum {RegExp}
 * @const
 */
exports.pattern = {
	newLine: /(\r\n|\n|\r)/gm,
	/**
	 * @example Video (960x720): <a href="http://youtu.be/obCgu3yJ4uw" rel="nofollow">youtu.be/obCgu3yJ4uw</a>
	 */
	video: /Video(\s*\((\d+)[x×](\d+)\))?:\s*<a[^>]+>[^\/]+\/([\w\-_]+)<\/a>/gi,
	url: /(http:\/\/[^\s\r\n]+)/g,
	/**
	 * Facebook album ID to be inserted into Enum.url.facebookAlbum
	 * @example 296706240428897.53174
	 * @example 296706240428897.53174
	 */
	facebookID: /\d{15}\.\d{5}/g,
	/** @see http://www.regular-expressions.info/regexbuddy/email.html */
	email: /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/gi,
	machineTag: /=/g,
	artist: /(Abbott|Wright|Bowman|Thomas)/g
};