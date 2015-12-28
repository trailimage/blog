'use strict';
/**
 * @module
 * @alias TI.enum
 */

/** @type int */
const s = 1000;
/** @type int */
const m = s * 60;
/** @type int */
const h = m * 60;
/** @type int */
const d = h * 24;
/** @type int */
const w = d * 7;
/** @type int */
const yard = 3;
/** @type int */
const mile = yard * 1760;
/** @type int */
const equator = mile * 24901;

/**
 * Distances in terms of feet
 * @enum Number
 * @const
 */
exports.distance = { equator: equator, mile: mile, yard: yard };

/**
 * Durations in terms of milliseconds
 * @enum Number
 * @const
 */
exports.time = { second: s, minute: m, hour: h, day: d, week: w };

/**
 * @type String[]
 * @const
 * @static
 */
exports.month = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/**
 * @type String[]
 * @const
 * @static
 */
exports.weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/**
 * @enum Number
 * @const
 * @static
 * @alias TI.httpStatus
 */
exports.httpStatus = {
	ok: 200,
	temporaryRedirect: 301,
	permanentRedirect: 302,
	unauthorized: 401,
	forbidden: 403,
	notFound: 404,
	internalError: 500,
	unsupported: 501,
	badGateway: 502,
	unavailable: 503
};

/**
 * @enum String
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
 * @const
 * @type {Object.<String, String>}
 * @see http://getbootstrap.com/components/
 */
exports.icon = {
	arrowDown: 'arrow-down',
	arrowLeft: 'arrow-left',
	arrowRight: 'arrow-right',
	arrowUp: 'arrow-up',
	asterisk: 'asterisk',
	banned: 'ban-circle',
	bell: 'bell',
	book: 'book',
	bullhorn: 'bullhorn',
	certificate: 'certificate',
	camera: 'camera',
	chevronLeft: 'chevron-left',
	chevronRight: 'chevron-right',
	cloud: 'cloud',
	cloudDownload: 'cloud-download',
	cog: 'cog',
	compressed: 'compressed',
	download: 'download',
	eye: 'eye-open',
	fire: 'fire',
	flash: 'flash',
	formula: 'baby-formula',
	gift: 'gift',
	globe: 'globe',
	heartOutline: 'heart-empty',
	hourglass: 'hourglass',
	leaf: 'leaf',
	lightning: 'flash',
	link: 'link',
	lock: 'lock',
	login: 'log-in',
	mapMarker: 'map-marker',
	marker: 'map-marker',
	newWindow: 'new-window',
	pencil: 'pencil',
	person: 'user',
	powerButton: 'off',
	refresh: 'refresh',
	remove: 'remove',
	road: 'road',
	save: 'save',
	saveFile: 'save-file',
	tag: 'tag',
	tags: 'tags',
	target: 'screenshot',
	tent: 'tent',
	thumbsUp: 'thumbs-up',
	transfer: 'transfer',
	trash: 'trash',
	upload: 'upload',
	user: 'user',
	x: 'remove',
	zoomIn: 'zoom-in',
	zoomOut: 'zoom-out'
};