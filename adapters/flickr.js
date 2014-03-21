var singleton = {};
var OAuth = require('oauth').OAuth;
var Setting = require('./../settings.js');
var Enum = require('./../enum.js');
var sys = require("sys");
var util = require("util");
var http = require("http");
/** @type {EventEmitter} */
var EventEmitter = require('events').EventEmitter;
var Format = require('./../format.js');
var log = require('winston');
/** @type {String} */
var userID = Setting.flickr.userID;
var host = 'api.flickr.com';
var baseUrl = '/services/rest/';
/** @type {String} */
var tokenSecret = null;
var oauth = new OAuth(
	Setting.flickr.url.requestToken,
	Setting.flickr.url.accessToken,
	Setting.flickr.key,
	Setting.flickr.secret,
	Setting.oauth.version,
	Format.string('http://{0}/authorize', Setting.domain),
	Setting.oauth.encryption);

log.info('Constructing Flickr service');
http.globalAgent.maxSockets = 200;

/**
 * @param {function(Flickr.Response)} callback
 * @see {@link http://www.flickr.com/services/api/flickr.tags.getListUserRaw.html}
 */
exports.getTags = function(callback)
{
	signedCall('tags.getListUserRaw', null, null, function(r) { callback(r); });
};

/**
 * Get collection of Flickr posts and photos
 * @param {function(Flickr.Tree)} callback method to call when collection is returned
 * @see {@link http://www.flickr.com/services/api/flickr.tags.getTree.html}
 */
exports.getCollection = function(callback)
{
	call('collections.getTree', 'user_id', userID, function(r)
	{
		callback(r.collections);
	});
};

/**
 * Retrieve additional set details
 * @param {String} id Flickr ID of the set
 * @param {function(Flickr.SetInfo)} callback Method to call after FlickrAPI responds
 * @see {@link http://www.flickr.com/services/api/flickr.photosets.getInfo.html}
 */
exports.getSetInfo = function(id, callback)
{
	var service = 'photosets.getInfo';

	call(service, 'photoset_id', id, function(r)
	{
		if (r != null)
		{
			if (r.stat == 'fail')
			{
				log.error('Call to Flickr.%s with %s returned "%s"', service, id, r.message);
				callback(null);
			}
			else
			{
				callback(r.photoset);
			}
		}
		else
		{
			log.error('Flickr %s service failed for %s', service, id);
			callback(null);
		}
	});
};

/**
 * The documentation says signing is not required but results differ even with entirely
 * public photos -- perhaps a Flickr bug
 * @param {String[]} tags
 * @param {function(Flickr.PhotoSummary[])} callback Method to call after FlickrAPI responds
 * @see http://www.flickr.com/services/api/flickr.photos.search.html
 */
exports.tagSearch = function(tags, callback)
{
	var service = 'photos.search';

	signedCall(service, 'user_id', userID, function(r)
		{
			if (r != null)
			{
				callback(r.photos.photo);
			}
			else
			{
				log.error('Flickr %s service failed for %s', service, userID);
				callback(null);
			}
		},
		{
			'extras': [singleton.size.thumbnail, singleton.size.square75, singleton.size.square150].join(),
			'tags': tags.join(),
			'per_page': 500         // maximum
		});
};

/**
 * Creates new setObject or updates an existing one
 * @param {String} id Flickr ID of the set
 * @param {size[]} imageSizes Image size optional parameters sent to service
 * @param {function(Flickr.SetPhotos, Flickr.SetInfo)} callback Method to call after Flickr responds
 * @param {Boolean} [alsoGetInfo = true] Whether to also call getInfo() for additional details
 * @see {@link http://www.flickr.com/services/api/flickr.photosets.getPhotos.html}
 * @see {@link http://www.flickr.com/services/api/flickr.photos.getInfo.html}
 */
exports.getSet = function(id, imageSizes, callback, alsoGetInfo)
{
	if (alsoGetInfo === undefined) { alsoGetInfo = true; }

	var service = 'photosets.getPhotos';

	call(service, 'photoset_id', id, function(r)
	{
		if (r == null)
		{
			log.error('Flickr %s service failed for %s', service, id);
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
	call('photos.getAllContexts', 'photo_id', id, function(r) { callback(r.set); });
};

/**
 * Get photo context
 * @param {String} id Flickr photo ID
 * @param {function(Flickr.Exif[])} callback
 * @see {@link http://www.flickr.com/services/api/flickr.photos.getExif.html}
 */
exports.getEXIF = function(id, callback)
{
	call('photos.getExif', 'photo_id', id, function(r) { callback(r.photo.exif); });
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
		callback(Format.string('{0}?oauth_token={1}', Setting.flickr.url.authorize, token));
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
		'port': 80,
		'method': 'GET',
		'path': baseUrl + parameterize(method, idType, id, args),
		'agent': false      // disable socket pooling
	};

	var request = http.request(options, function(response)
	{
		var result= "";
		response.setEncoding('utf8');
		response.on('data', function (chunk) { result += chunk; });
		response.on('end', function()
		{
			if (result) { result = result.replace(/\\'/g,"'"); }

			try
			{
				var json = JSON.parse(result);
				callback(json);
			}
			catch (ex)
			{
				log.error('Parsing %s resulted in %s', options.path, ex.toString());

				if (/<html>/.test(result))
				{
					// Flickr returned an HTML response instead of JSON -- likely an error message
					// see if we can swallow it
					log.error('Flickr returned HTML instead of JSON');
					callback(null);
				}
				else
				{
					this.emit('error', ex)
				}
			}
		});
	});

	request.on('error', function(e)
	{
		log.error('Calling %s resulted in %j', options.path, e.toString());
		this.emit('error', e);
	});
	request.end();
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
	var url = Format.string('http://{0}/{1}{2}', host, baseUrl, qs);

	oauth.get(url, Setting.flickr.token, Setting.flickr.tokenSecret, function(error, data)
	{
		if (error) { log.error(error); } else {	callback(JSON.parse(data));	}
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

		if (Format.isEmpty(p.url_l))
		{
			// find the next largest if no large available
			var otherSize = singleton.size.medium800;
			if (Format.isEmpty(p[otherSize])) { otherSize = singleton.size.medium640; }
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

	args['api_key'] = Setting.flickr.key;
	args['format'] = 'json';
	args['nojsoncallback'] = 1;
	args['method'] = 'flickr.' + method;

	if (idType && id) { args[idType] = id; }

	for (var k in args) { qs += op + k + '=' + args[k];	op = '&'; }

	return qs;
}

/** @see {@link http://nodejs.org/docs/latest/api/util.html#util_util_inherits_constructor_superconstructor} */
util.inherits(module.exports, EventEmitter);