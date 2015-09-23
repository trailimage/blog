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

exports.pattern = require('./regex.js');