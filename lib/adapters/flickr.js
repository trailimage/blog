var OAuth = require('oauth').OAuth;
var setting = require('./../settings.js');
var Enum = require('./../enum.js');
var http = require('https');
var format = require('./../format.js');
var log = require('winston');
/** @type {String} */
var userID = setting.flickr.userID;
var host = 'api.flickr.com';
var baseUrl = '/services/rest/';
/** @type {String} */
var tokenSecret = null;
var oauth = new OAuth(
	setting.flickr.url.requestToken,
	setting.flickr.url.accessToken,
	setting.flickr.key,
	setting.flickr.secret,
	setting.oauth.version,
	format.string('http://{0}/authorize', setting.domain),
	setting.oauth.encryption);

log.info('Constructing Flickr service');
http.globalAgent.maxSockets = 200;

/**
 * @param {function(Flickr.Response)} callback
 * @see {@link http://www.flickr.com/services/api/flickr.tags.getListUserRaw.html}
 */
exports.getTags = function(callback)
{
	signedCall('tags.getListUserRaw', null, null, callback);
};

/**
 * Get collection of Flickr posts and photos
 * @param {function(Flickr.Tree)} callback method to call when collection is returned
 * @see {@link http://www.flickr.com/services/api/flickr.tags.getTree.html}
 */
exports.getCollection = function(callback)
{
	call('collections.getTree', 'user_id', userID, function(r) { callback((r) ? r.collections : null); });
};

/**
 * Retrieve additional set details
 * @param {String} id Flickr ID of the set
 * @param {function(Flickr.SetInfo)} callback Method to call after FlickrAPI responds
 * @see {@link http://www.flickr.com/services/api/flickr.photosets.getInfo.html}
 */
exports.getSetInfo = function(id, callback)
{
	call('photosets.getInfo', 'photoset_id', id, function(r) { callback((r) ? r.photoset : null); });
};

/**
 * The documentation says signing is not required but results differ even with entirely
 * public photos -- perhaps a Flickr bug
 * @param {String[]} tags
 * @param {function(PhotoSummary[])} callback Method to call after FlickrAPI responds
 * @see http://www.flickr.com/services/api/flickr.photos.search.html
 */
exports.tagSearch = function(tags, callback)
{
	var service = 'photos.search';

	signedCall(service, 'user_id', userID, function(r) { callback((r) ? r.photos.photo : null); },
	{
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
exports.getSet = function(id, imageSizes, alsoGetInfo, callback)
{
	if (alsoGetInfo === undefined) { alsoGetInfo = false; }

	var service = 'photosets.getPhotos';

	call(service, 'photoset_id', id, function(r)
	{
		if (r == null)
		{
			callback(null, null);
			return;
		}

		/** @type {Flickr.SetPhotos} */
		var photos = normalizePhotos(r.photoset);

		if (alsoGetInfo)
		{
			exports.getSetInfo(id, function(info) { callback(photos, info); });
		}
		else
		{
			callback(photos, null);
		}
	},
	{
		'extras': imageSizes.concat(['description', 'tags', 'date_taken', 'geo']).join()
	});
};

/**
 * Get photo context
 * @param {String} id FlickrAPI photo ID
 * @param {function(Flickr.MemberSet[])} callback
 * @see {@link http://www.flickr.com/services/api/flickr.photos.getAllContexts.html}
 */
exports.getContext = function(id, callback)
{
	/** @var {Flickr.PhotoMembership} r */
	call('photos.getAllContexts', 'photo_id', id, function(r) { callback((r) ? r.set : null); });
};

/**
 * Get photo context
 * @param {String} id Flickr photo ID
 * @param {function(Flickr.Exif[])} callback
 * @see {@link http://www.flickr.com/services/api/flickr.photos.getExif.html}
 */
exports.getEXIF = function(id, callback)
{
	call('photos.getExif', 'photo_id', id, function(r) { callback((r) ? r.photo.exif : null); });
};

/**
 * Get photo sizes
 * @param {String} id Flickr photo ID
 * @param {function(Flickr.Response)} callback Method to call when FlickrAPI responds
 * @see {@link http://www.flickr.com/services/api/flickr.photos.getSizes.html}
 */
exports.getSizes = function(id, callback)
{
	call('photos.getSizes', 'photo_id', id, callback);
};

//- Tokens --------------------------------------------------------------------

/**
 * @param {function(String)} callback
 */
exports.getRequestToken = function(callback)
{
	oauth.getOAuthRequestToken(function(error, token, secret, results)
	{
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
exports.getAccessToken = function(token, verifier, callback)
{
	oauth.getOAuthAccessToken(token, tokenSecret, verifier, function(error, accessToken, accessTokenSecret, accessResults)
	{
		tokenSecret = null;

		if (error) { log.error(error); return; }

		callback(accessToken, accessTokenSecret);
	});
};

//- Enums ---------------------------------------------------------------------

/**
 * @enum {String}
 * @const
 */
exports.size =
{
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
 * @enum {String|Object}
 * @const
 */
exports.sort =
{
	date:
	{
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
exports.ExifSpace =
{
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
 * @param {String} method Name of FlickrAPI API method to call
 * @param {String} idType Type of FlickrAPI ID whether photo, set, collection, etc.
 * @param {String} id FlickrAPI object ID
 * @param {function(Flickr.Response)} callback Method to call when service completes
 * @param {Object.<String>} [args] Additional arguments
 * @see {@link http://www.flickr.com/services/api/response.json.html}
 */
function call(method, idType, id, callback, args)
{
	var options =
	{
		'hostname': host,
		'port': 443,
		'method': 'GET',
		'path': baseUrl + parameterize(method, idType, id, args),
		'agent': false      // disable socket pooling
	};

	var request = http.request(options, function(response)
	{
		var result= "";
		response.setEncoding('utf8');
		response.on('data', function (chunk) { result += chunk; });
		response.on('end', function() { callback(sanitize(method, id, result)); });
	});

	request.on('error', function(e)
	{
		log.error('Calling %s resulted in %j', options.path, e.toString());
		callback(null);
	});
	request.end();
}

/**
 * @param {String} method
 * @param {String} id
 * @param {String} response
 * @returns {Object}
 */
function sanitize(method, id, response)
{
	var json = null;

	if (response) { response = response.replace(/\\'/g,"'"); }

	try
	{
		json = JSON.parse(response);
	}
	catch (ex)
	{
		log.error('Parsing call to %s with %s resulted in %s', method, id, ex.toString());

		if (/<html>/.test(response))
		{
			// Flickr returned an HTML response instead of JSON -- likely an error message
			// see if we can swallow it
			log.error('Flickr returned HTML instead of JSON');
		}
		return null;
	}

	if (json == null)
	{
		log.error('Call to %s with %s returned null', method, id);
	}
	else if (json.stat == 'fail')
	{
		log.error('%s when calling %s with %s (code %s)', json.message, method, id, json.code);
		json = null;
	}
	return json;
}

/**
 * Execute signed service call
 * @param {String} method Name of FlickrAPI API method to call
 * @param {String} idType Type of FlickrAPI ID whether photo, set, collection, etc.
 * @param {String} id FlickrAPI object ID
 * @param {function(Flickr.Response)} callback Method to call when service completes
 * @param {Object.<String>} [args] Additional arguments
 * @see {@link http://www.flickr.com/services/api/response.json.html}
 */
function signedCall(method, idType, id, callback, args)
{
	var qs = parameterize(method, idType, id, args);
	var url = format.string('https://{0}/{1}{2}', host, baseUrl, qs);

	oauth.get(url, setting.flickr.token, setting.flickr.tokenSecret, function(error, data)
	{
		if (error)
		{
			log.error(error);
			callback(null);
		}
		else
		{
			callback(sanitize(method, id, data));
		}
	});
}

/**
 * @param {Flickr.SetPhotos} photos
 * @return {Flickr.SetPhotos}
 */
function normalizePhotos(photos)
{
	"use strict";

	/** @type {Flickr.PhotoSummary} */
	var p = null;

	for (var i = 0; i < photos.photo.length; i++)
	{
		p = photos.photo[i];
		p.index = i + 1;  // expando property

		if (format.isEmpty(p.url_l))
		{
			// find the next largest if no large available
			var otherSize = exports.size.medium800;
			if (format.isEmpty(p[otherSize])) { otherSize = exports.size.medium640; }
			var suffix = otherSize.replace('url', '');
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
 * @param {Object.<String>} [args] Additional parameters
 * @return {String}
 */
function parameterize(method, idType, id, args)
{
	var qs = '';
	var op = '?';

	if (args === undefined || args === null) { args = {}; }

	args['api_key'] = setting.flickr.key;
	args['format'] = 'json';
	args['nojsoncallback'] = 1;
	args['method'] = 'flickr.' + method;

	if (idType && id) { args[idType] = id; }

	for (var k in args) { qs += op + k + '=' + args[k];	op = '&'; }

	return qs;
}