'use strict';

const OAuth = require('./../oauth.js');
const setting = require('./../settings.js');
const Enum = require('./../enum.js');
const is = require('./../is.js');
const http = require('https');
const format = require('./../format.js');
const request = require('request');
const log = require('./../log.js');
/** @type {String} */
const userID = setting.flickr.userID;
const host = 'api.flickr.com';
const baseUrl = '/services/rest/';

let retries = {};
/** @type {String} */
let tokenSecret = null;
let oauth = new OAuth(
	setting.flickr.url.requestToken,
	setting.flickr.url.accessToken,
	setting.flickr.key,
	setting.flickr.secret,
	setting.oauth.version,
	`http://${setting.domain}/authorize`,
	setting.oauth.encryption);

log.info('Constructing Flickr service');
http.globalAgent.maxSockets = 200;

//- API calls -----------------------------------------------------------------

/**
 * @param {function(Flickr.Response)} callback
 * @see {@link http://www.flickr.com/services/api/flickr.tags.getListUserRaw.html}
 */
exports.getTags = callback => { signedCall('tags.getListUserRaw', null, null, callback); };

/**
 * Get collection of Flickr posts and photos
 * @param {function(Flickr.Tree)} callback method to call when collection is returned
 * @see {@link http://www.flickr.com/services/api/flickr.tags.getTree.html}
 */
exports.getCollection = callback => {
	call('collections.getTree', 'user_id', userID, r => { callback((r) ? r.collections : null); });
};

/**
 * Retrieve additional set details
 * @param {String} id Flickr ID of the set
 * @param {function(Flickr.SetInfo)} callback Method to call after FlickrAPI responds
 * @see {@link http://www.flickr.com/services/api/flickr.photosets.getInfo.html}
 */
exports.getSetInfo = (id, callback) => {
	call('photosets.getInfo', 'photoset_id', id, r => { callback((r) ? r.photoset : null) });
};

/**
 * The documentation says signing is not required but results differ even with entirely
 * public photos -- perhaps a Flickr bug
 * @param {String[]} tags
 * @param {function(PhotoSummary[])} callback Method to call after FlickrAPI responds
 * @see http://www.flickr.com/services/api/flickr.photos.search.html
 */
exports.tagSearch = (tags, callback) => {
	let service = 'photos.search';

	signedCall(service, 'user_id', userID, r => { callback(is.value(r) ? r.photos.photo : null); }, {
		'extras': [exports.size.thumbnail, exports.size.square75, exports.size.square150].join(),
		'tags': tags.join(),
		'sort': exports.sort.relevance,
		'per_page': 500         // maximum
	});
};

/**
 * Creates new setObject or updates an existing one
 * @param {String} id Flickr ID of the set
 * @param {string[]} imageSizes Image size optional parameters sent to service
 * @param {Boolean} [alsoGetInfo = false] Whether to also call getInfo() for additional details
 * @param {function(Flickr.SetPhotos, Flickr.SetInfo)} callback Method to call after Flickr responds
 * @see {@link http://www.flickr.com/services/api/flickr.photosets.getPhotos.html}
 * @see {@link http://www.flickr.com/services/api/flickr.photos.getInfo.html}
 */
exports.getSet = (id, imageSizes, alsoGetInfo, callback) => {
	if (alsoGetInfo === undefined) { alsoGetInfo = false; }

	const service = 'photosets.getPhotos';

	call(service, 'photoset_id', id, r => {
		if (r === null) { callback(null, null); return; }    // error

		/** @type {Flickr.SetPhotos} */
		let photos = normalizePhotos(r.photoset, imageSizes);

		if (alsoGetInfo) {
			// make second call to get additional set information
			exports.getSetInfo(id, info => { callback(photos, info); });
		} else {
			callback(photos, null);
		}
	},
	{ 'extras': imageSizes.concat(['description', 'tags', 'date_taken', 'geo']).join() });
};

/**
 * Get photo context
 * @param {String} id FlickrAPI photo ID
 * @param {function(Flickr.MemberSet[])} callback
 * @see {@link http://www.flickr.com/services/api/flickr.photos.getAllContexts.html}
 */
exports.getContext = (id, callback) => {
	/** @var {Flickr.PhotoMembership} r */
	call('photos.getAllContexts', 'photo_id', id, r => { callback((r) ? r.set : null); });
};

/**
 * Get photo context
 * @param {String} id Flickr photo ID
 * @param {function(Flickr.Exif[])} callback
 * @see {@link http://www.flickr.com/services/api/flickr.photos.getExif.html}
 */
exports.getEXIF = (id, callback) => {
	call('photos.getExif', 'photo_id', id, function(r) { callback((r) ? r.photo.exif : null); });
};

/**
 * Get photo sizes
 * @param {String} id Flickr photo ID
 * @param {function(Flickr.Response)} callback Method to call when FlickrAPI responds
 * @see {@link http://www.flickr.com/services/api/flickr.photos.getSizes.html}
 */
exports.getSizes = (id, callback) => {	call('photos.getSizes', 'photo_id', id, callback); };

//- Tokens --------------------------------------------------------------------

/**
 * @param {function(String)} callback
 */
exports.getRequestToken = callback => {
	oauth.getOAuthRequestToken((error, token, secret) => {
		if (error) { log.error(error); return; }

		// token and secret are both needed for the next call but token is
		// echoed back from the authorize service
		tokenSecret = secret;
		callback(format.string('{0}?oauth_token={1}', setting.flickr.url.authorize, token));
	});
};

/**
 *
 * @param {String} token
 * @param {String} verifier
 * @param {function(string, string)} callback
 */
exports.getAccessToken = (token, verifier, callback) => {
	oauth.getOAuthAccessToken(token, tokenSecret, verifier, (error, accessToken, accessTokenSecret) => {
		tokenSecret = null;
		if (error) { log.error(error); return; }
		callback(accessToken, accessTokenSecret);
	});
};

//- Enums ---------------------------------------------------------------------

/**
 * Flickr size tokens
 * @enum {String}
 * @const
 */
exports.size = {
	thumbnail:  'url_t',
	square75:	'url_sq',
	square150:  'url_q',
	small240:   'url_s',
	small320:   'url_n',
	medium500:  'url_m',
	medium640:  'url_z',
	medium800:  'url_c',
	large1024:  'url_l',
	large1600:  'url_h',
	large2048:  'url_k',
	original:   'url_o'
};

/*
 s	small square 75x75
 q	large square 150x150
 t	thumbnail, 100 on longest side
 m	small, 240 on longest side
 n	small, 320 on longest side
 -	medium, 500 on longest side
 z	medium 640, 640 on longest side
 c	medium 800, 800 on longest side†
 b	large, 1024 on longest side*
 o	original image, either a jpg, gif or png, depending on source format
 */

/**
 * Flickr sort options
 * @enum {String|Object}
 * @const
 */
exports.sort = {
	date: {
		posted: { ascending: 'date-posted-asc', descending: 'date-posted-desc' },
		taken: { ascending: 'date-taken-asc', descending: 'date-taken-desc' }
	},
	interestingness: { ascending: 'interestingness-asc', descending: 'interestingness-desc' },
	relevance: 'relevance'
};

/**
 * @enum {String}
 * @const
 */
exports.ExifSpace = {
	IFD0: 'IFD0',
	IFD1: 'IFD1',
	ExifIFD: 'ExifIFD',
	GPS: 'GPS',
	Photoshop: 'Photoshop',
	IPTC: 'IPTC',
	IccView: 'ICC-view',
	IccMeasure: 'ICC-meas',
	XmpX: 'XMP-x',
	XmpXmp: 'XMP-xmp',
	XmpAux: 'XMP-aux',
	XmpPhotoshop: 'XMP-photoshop',
	XmpMM: 'XMP-xmpMM',
	XmpDC: 'XMP-dc',
	XmpRights: 'XMP-xmpRights',
	XmpIPTC: 'XMP-iptcCore',
	Adobe: 'Adobe'
};

//- Private methods -----------------------------------------------------------

/**
 * Execute service call
 * @param {String} method Name of Flickr API method to call
 * @param {String} idType Type of Flickr ID whether photo, set, collection, etc.
 * @param {String} id Flickr object ID
 * @param {function(Flickr.Response)} callback Method to call when service completes
 * @param {Object.<String>} [args] Additional arguments
 * @see {@link http://www.flickr.com/services/api/response.json.html}
 */
function call(method, idType, id, callback, args) {
	let callArgs = arguments;
	let options = {
		url: 'https://' + host + baseUrl + parameterize(method, idType, id, args),
		headers: { 'User-Agent': 'node.js' }
	};

	if (!is.empty(setting.proxy)) { options.proxy = setting.proxy; }

	request(options, (error, response, body) => {
		if (error === null) {
			sanitize(call, callArgs, body);
		} else {
			log.error('Calling %s resulted in %j', options.path, error.toString());
			retry(call, callArgs);
		}
	});
}

/**
 * Retry service call if bad response and less than max retries
 * @param {function(String, String, String, function, object)} fn Call to retry
 * @param {Array} args Original call arguments
 */
function retry(fn, args) {
	let count = 1;
	let method = args[0];
	let id = args[2];
	let callback = args[3];
	let key = method + '-' + id;
	let scope = this;

	if (is.defined(retries, key)) { count = ++retries[key]; } else { retries[key] = count; }

	if (count > setting.flickr.maxRetries) {
		retries[key] = 0;
		log.error('Call to %s with %s failed after %s tries', method, id, setting.flickr.maxRetries);
		callback(null);
	} else {
		log.warn('Retry %s for %s with %s', count, method, id);
		setTimeout(() => { fn.apply(scope, args); }, setting.flickr.retryDelay);
	}
}

/**
 * Clear retry count and log success
 * @param {String} method
 * @param {String} id
 */
function clearRetries(method, id) {
	let key = method + '-' + id;

	if (is.defined(retries, key) && retries[key] > 0) {
		log.info('Call to %s with %s succeeded', method, id);
		retries[key] = 0;
	}
}

/**
 * Parse Flickr response and handle different kinds of error conditions
 * @param {function(String, String, String, function, object)} fn Call to retry
 * @param {Array} args Original call arguments
 * @param {String} response
 */
function sanitize(fn, args, response) {
	let json = null;
	let method = args[0];
	let id = args[2];
	let callback = args[3];

	if (response) { response = response.replace(/\\'/g,"'"); }

	try {
		json = JSON.parse(response);

		if (json == null) {
			log.error('Call to %s with %s returned null', method, id);
		} else if (json.stat == 'fail') {
			log.error('%s when calling %s with %s (code %s)', json.message, method, id, json.code);
			json = null;
		}
	} catch (ex) {
		log.error('Parsing call to %s with %s resulted in %s', method, id, ex.toString());

		if (/<html>/.test(response)) {
			// Flickr returned an HTML response instead of JSON -- likely an error message
			// see if we can swallow it
			log.error('Flickr returned HTML instead of JSON');
		}
		json = null;
	}

	if (json === null) { retry(fn, args); } else { clearRetries(method, id); callback(json);	}
}

/**
 * Execute signed service call
 * @param {String} method Name of Flickr API method to call
 * @param {String} idType Type of Flickr ID whether photo, set, collection, etc.
 * @param {String} id FlickrAPI object ID
 * @param {function(Flickr.Response)} callback Method to call when service completes
 * @param {Object.<String>} [args] Additional arguments
 * @see {@link http://www.flickr.com/services/api/response.json.html}
 */
function signedCall(method, idType, id, callback, args) {
	let callArgs = arguments;
	let qs = parameterize(method, idType, id, args);
	let url = format.string('https://{0}/{1}{2}', host, baseUrl, qs);

	oauth.get(url, setting.flickr.token, setting.flickr.tokenSecret, (error, data) => {
		if (error) {
			log.error(error);
			retry(signedCall, callArgs);
		} else {
			sanitize(signedCall, callArgs, data);
		}
	});
}

/**
 * @param {Flickr.SetPhotos} photos
 * @param {String[]} sizes
 * @return {Flickr.SetPhotos}
 */
function normalizePhotos(photos, sizes) {
	for (let i = 0; i < photos.photo.length; i++) {
		/** @type {Flickr.PhotoSummary} */
		let p = photos.photo[i];

		p.index = i + 1;  // expando property
		p.latitude = parseFloat(p.latitude);
		p.longitude = parseFloat(p.longitude);
		p.isprimary = (parseInt(p.isprimary) == 1);

		for (let s of sizes) {
			let suffix = s.remove('url');
			let width = 'width' + suffix;
			let height = 'height' + suffix;
			p[width] = parseInt(p[width]);
			p[height] = parseInt(p[height]);
		}

		if (is.empty(p.url_l)) {
			// find the next largest if no large available
			let otherSize = exports.size.medium800;
			if (is.empty(p[otherSize])) { otherSize = exports.size.medium640; }
			let suffix = otherSize.remove('url');
			// treat the other size as large
			p.url_l = p['url' + suffix];
			p.width_l = p['width' + suffix];
			p.height_l = p['height' + suffix];
		}
	}
	return photos;
}

/**
 * Setup standard parameters
 * @param {String} method Name of flickr API method to call
 * @param {String} [idType] The type of ID whether photo, set or other
 * @param {String} [id] ID of the flickr object
 * @param {Flickr.API} [args] Additional parameters
 * @return {String}
 */
function parameterize(method, idType, id, args) {
	let qs = '';
	let op = '?';

	if (!is.value(args)) { args = {}; }

	args.api_key = setting.flickr.key;
	args.format = 'json';
	args.nojsoncallback = 1;
	args.method = 'flickr.' + method;

	if (idType && id) { args[idType] = id; }

	for (let k in args) { qs += op + k + '=' + args[k]; op = '&'; }

	return qs;
}