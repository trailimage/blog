'use strict';

const Enum = require('./enum.js');
const format = require('./format.js');
const template = require('./template.js');

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

(function() {
	let url = require('url');
	exports.redis = url.parse(env('REDISCLOUD_URL'));
	exports.redis.auth = exports.redis.auth.split(":")[1];
})();


exports.env = env;
/** @type {String} */
exports.proxy = env('HTTPS_PROXY');
/** @type {Number} */
exports.timestamp = new Date().getTime();
/** @type {Boolean} */
exports.isProduction = (env('NODE_ENV') === 'production');
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
 * @object
 * @property {String} key
 * @property {String} userID
 * @property {Number} maxRetries
 * @see https://dashboard.heroku.com/apps/trail-image/settings
 */
exports.flickr = {
	key: env('FLICKR_KEY'),
	userID: '60950751@N04',
	appID: '72157631007435048',
	secret: env('FLICKR_SECRET'),
	token: env('FLICKR_TOKEN'),
	tokenSecret: env('FLICKR_TOKEN_SECRET'),
	defaultCollection: '72157630885395608',
	maxRetries: 10,
	retryDelay: 300,
	photoSet: {
		featured: '72157631638576162',
		poetry: '72157632729508554'
	},
	/** @enum {String} */
	url: {
		requestToken: 'http://www.flickr.com/services/oauth/request_token',
		authorize: 'http://www.flickr.com/services/oauth/authorize',
		accessToken: 'http://www.flickr.com/services/oauth/access_token',
		photoSet: 'http://www.flickr.com/photos/trailimage/sets/'
	},
	useCache: true
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