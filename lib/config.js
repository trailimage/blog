'use strict';

const Enum = require('./enum.js');
const format = require('./format.js');
const template = require('./template.js');
const ProviderManager = require('./providers/manager.js');

/**
 * Return environment value or throw an error if it isn't found
 * @param {String} key
 * @returns {String}
 */
function env(key) {
	let value = process.env[key];
	if (value === undefined) { throw new Error(`Environment value ${key} must be set`); }
	return value;
}

exports.provider = new ProviderManager();

exports.env = env;
/** @type {String} */
exports.proxy = process.env['HTTPS_PROXY'];
/** @type {Number} */
exports.timestamp = new Date().getTime();
/** @type {Boolean} */
exports.isProduction = (process.env['NODE_ENV'] === 'production');
/** @type {String} */
exports.logFile = './temp/trail-image.log';
/** @type {Boolean} */
exports.cacheOutput = exports.isProduction;
/** @type {number} */
exports.timezone = -6;
/** @type {String} */
exports.contactEmail = 'contact@trailimage.com';
/** @type {String} */
exports.contactLink = `<a href="mailto:${exports.contactEmail}">Contact</a>`;

/**
 * @enum {Number|Number[]}
 */
exports.map = {
	minimumTrackLength: 0.2,
	minimumTrackPoints: 5,
	maxDeviationFeet: 0.5,
	privacyCenter: [-116.17248, 43.58355],  // reverse order from Google map listing
	privacyMiles: 1
};

/**
 * @enum {String}
 */
exports.bing = {
	key: process.env['BING_KEY']
};

/**
 * @enum {String}
 * @see https://github.com/ciaranj/node-oauth
 */
exports.oauth = {
	version: '1.0A',
	encryption: 'HMAC-SHA1'
};

exports.cacheDuration = Enum.time.day * 2;
exports.retryDelay = Enum.time.second * 30;

/**
 * @enum {string|boolean}
 * @see https://developers.facebook.com/docs/reference/plugins/like/
 * @see https://developers.facebook.com/apps/110860435668134/summary
 */
exports.facebook = {
	appID: '110860435668134',
	pageID: '241863632579825',
	siteID: '578261855525416',
	adminID: '1332883594',
	enabled: true,
	authorURL: 'https://www.facebook.com/jason.e.abbott'
};

/**
 * @see http://code.google.com/apis/console/#project:1033232213688
 * @see http://developers.google.com/maps/documentation/staticmaps/
 * @type {string}
 */
exports.google = {
	apiKey: process.env['GOOGLE_KEY'],
	projectID: '1033232213688',
	analyticsID: '22180727',        // shown as 'UA-22180727-1
	searchEngineID: process.env['GOOGLE_SEARCH_ID'],
	blogID: '118459106898417641',
	maxMarkers: 70      // max URL is 2048; 160 is used for base URL; each coordinate needs about 26 characters
};

/**
 * Remove overly generic photo tags
 * @type {String[]}
 * @const
 * @static
 */
exports.removeTag = ['Idaho','United States of America','Abbott','LensTagger','Boise'];

/**
 * @type {string}
 * @const
 */
exports.domain = 'trailimage.com';

/**
 * @type {String}
 * @const
 */
exports.title = 'Trail Image';

/**
 * @type {String}
 * @const
 */
exports.subtitle = 'Adventure Photography by Jason Abbott';

/**
 * @type {String}
 * @const
 */
exports.namespace = 'TrailImage';

/**
 * @type {String}
 * @const
 */
exports.description = 'Stories, image and videos of small adventure trips in and around the state of Idaho';

/**
 * @type {String}
 * @const
 */
exports.keywords = 'BMW R1200GS, KTM XCW, jeep wrangler, motorcycle, motorcycling, riding, adventure, Jason Abbott, Abbott, outdoors, scenery, idaho, mountains';

/**
 * Extract configuration from URL
 * @param {String} url
 * @example redis://<user>:<password>@pub-redis-18223.us-east-1-1.2.ec2.garantiadata.com:18223
 */
exports.fromUrl = function(url) {
	let config = {
		username: null,
		password: null,
		url: null,
		port: 80
	};

	if (url.includes('@')) {
		let parts = url.split('@');
		let auth = parts[0].split(':');
		url = parts[1];

		config.username = auth[0];
		config.password = auth[1];
	}

	if (url.includes(':')) {
		let parts = url.split(':');
		config.port = parts[1];
		url = parts[0];
	}

	config.url = url;
	return config;
};