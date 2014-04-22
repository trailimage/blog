"use strict";

/** @type {int} */
var s = 1000;
/** @type {int} */
var m = s * 60;
/** @type {int} */
var h = m * 60;
/** @type {int} */
var d = h * 24;
/** @type {int} */
var w = d * 7;
/** @type {int} */
var yard = 3;
/** @type {int} */
var mile = yard * 1760;
/** @type {int} */
var equator = mile * 24901;

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
exports.httpStatus =
{
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
 * @enum {RegExp}
 * @const
 */
exports.pattern =
{
	haiku: /^([ \w]{5,100})[\r\n]+([ \w]{5,100})[\r\n]+([ \w]{5,100})([\r\n]{2}|$)+/gi,
	allHaiku: /^([ \w]{5,100})[\r\n]+([ \w]{5,100})[\r\n]+([ \w]{5,100})$/gi,
	// look-ahead for end-quote meant to preclude snippets of dialog
	allPoem: /^(([^\r\n](?!” )){3,100}([\r\n]|$)+){4,}$/gi,
	// exclude dialog by negating comma or question mark before closing quote unless its footnoted
	poetry: /(^|[\r\n]{1,2})((([^\r\n](?![,?]”[^⁰¹²³⁴⁵⁶⁷⁸⁹])){5,80}[\r\n]{1,2}){3,})/gi,
	newLine: /(\r\n|\n|\r)/gm,
	// match superscripts but don't match atomic numbers
	superscript: /([^\/\s])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)(?!\w)/g, // /[^⁰¹²³⁴⁵⁶⁷⁸⁹](¹|²|³|⁴|⁵|⁶|⁷|⁸|⁹|¹⁰|¹¹|¹²|¹³|¹⁴|¹⁵)[^⁰¹²³⁴⁵⁶⁷⁸⁹]/g,
	/**
	 * @example Video (960x720): <a href="http://youtu.be/obCgu3yJ4uw" rel="nofollow">youtu.be/obCgu3yJ4uw</a>
	 */
	video: /Video(\s*\((\d+)[x×](\d+)\))?:\s*<a[^>]+>[^\/]+\/([\w\-_]+)<\/a>/gi,
	url: /(http:\/\/[^\s\r\n]+)/g,
	link: /<a href=["']([^"']+)['"][^>]*>([^<]+)<\/a>/g,
	badLinkTag: /<\/a>(\([\w\/\.\-%\)\(]+)/g,
	footnotes: /((<p><\/p>)?<p>\s*<\/p>)?((<p>|\[POEM\])[*⁰¹²³⁴⁵⁶⁷⁸⁹].+)$/gm,
	blockQuote: /[\r\n]*(“[^”]{275,}”[⁰¹²³⁴⁵⁶⁷⁸⁹]*)\s*[\r\n]/g,
	/**
	 * Facebook album ID to be inserted into Enum.url.facebookAlbum
	 * @example 296706240428897.53174
	 * @example 296706240428897.53174
	 */
	facebookID: /\d{15}\.\d{5}/g,
	/** @see http://www.regular-expressions.info/regexbuddy/email.html */
	email: /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/gi,
	machineTag: /=/g
};