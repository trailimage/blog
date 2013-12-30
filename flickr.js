var singleton = {};
var OAuth = require('oauth').OAuth;
var Setting = require('./settings.js');
var Enum = require('./enum.js');
var sys = require("sys");
var util = require("util");
var http = require("http");
/** @type {EventEmitter} */
var EventEmitter = require('events').EventEmitter;
var Format = require('./format.js');
var log = require('winston');

/**
 * @constructor
 * @inherit {EventEmitter}
 * @see https://github.com/sujal/node-flickr
 * @see http://www.flickr.com/services/api/auth.oauth.html
 */
function FlickrAPI()
{
	/** @type {FlickrAPI} */
	var _this = this;
	/** @type {String} */
	var _userID = Setting.flickr.userID;
	var _host = 'api.flickr.com';
	var _baseUrl = '/services/rest/';
	/** @type {String} */
	var _tokenSecret = null;

	var _oauth = new OAuth(
		Setting.flickr.url.requestToken,
		Setting.flickr.url.accessToken,
		Setting.flickr.key,
		Setting.flickr.secret,
		Setting.oauth.version,
		Format.string('http://{0}/authorize', Setting.domain),
		Setting.oauth.encryption);

	EventEmitter.call(this);

	/**
	 * Execute service call
	 * @param {String} method Name of FlickrAPI API method to call
	 * @param {String} idType Type of FlickrAPI ID whether photo, set, collection, etc.
	 * @param {String} id FlickrAPI object ID
	 * @param {function(Flickr.Response)} callback Method to call when service completes
	 * @param {Array.<String>} [extras] Additional fields to return from the service
	 * @see {@link http://www.flickr.com/services/api/response.json.html}
	 */
	function call(method, idType, id, callback, extras)
	{
		var options =
		{
			'hostname': _host,
			'port': 80,
			'method': 'GET',
			'path': _baseUrl + parameterize(method, idType, id, extras),
			'agent': false      // disable socket pooling
		};

		//console.log('http://' + _host + options.path);

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
					log.error('Parsing %s resulted in %s', options.path, ex);
					_this.emit('error', ex)
				}
			});
		});

		request.on('error', function(e)
		{
			log.error('Calling %s resulted in %j', options.path, e);
			_this.emit('error', e);
		});
		request.end();
	}

	/**
	 * @param {function(Flickr.TagInfo)} callback
	 * @see {@link http://www.flickr.com/services/api/flickr.tags.getListUserRaw.html}
	 */
	this.getTags = function(callback)
	{
		var method = 'tags.getListUserRaw';
		var url = Format.string('http://{0}/{1}{2}', _host, _baseUrl, parameterize(method));

		_oauth.get(url, Setting.flickr.token, Setting.flickr.tokenSecret, function(error, data)
		{
			if (error) { log.error(error); } else {	callback(JSON.parse(data)); }
		});
	};

	/**
	 * Get collection of Flickr sets and photos
	 * @param {function(Flickr.Tree)} callback method to call when collection is returned
	 * @see {@link http://www.flickr.com/services/api/flickr.collections.getTree.html}
	 */
	this.getCollection = function(callback)
	{
		call('collections.getTree', 'user_id', _userID, function(r)
		{
			callback(r.collections);
		});
	};

	/**
	 * Creates new setObject or updates an existing one
	 * @param {String} id Flickr ID of the set
	 * @param {Array.<FlickrAPI.size>} imageSizes Image size optional parameters sent to service
	 * @param {function(Flickr.SetPhotos, Flickr.SetInfo)} callback Method to call after Flickr responds
	 * @param {Boolean} [alsoGetInfo = true] Whether to also call getInfo() for additional details
	 * @see {@link http://www.flickr.com/services/api/flickr.photosets.getPhotos.html}
	 * @see {@link http://www.flickr.com/services/api/flickr.photos.getInfo.html}
	 */
	this.getSet = function(id, imageSizes, callback, alsoGetInfo)
	{
		if (alsoGetInfo === undefined) { alsoGetInfo = true; }

		call('photosets.getPhotos', 'photoset_id', id, function(r)
			{
				/** @type {Flickr.SetPhotos} */
				var photos = normalizePhotos(r.photoset);

				if (alsoGetInfo)
				{
					_this.getSetInfo(id, function(info) { callback(photos, info); });
				}
				else
				{
					callback(photos, null);
				}
			},
			imageSizes.concat(['description', 'tags', 'date_taken', 'geo'])		// extras
		);
	};

	/**
	 * Retrieve additional set details
	 * @param {String} id Flickr ID of the set
	 * @param {function(Flickr.SetInfo)} callback Method to call after FlickrAPI responds
	 * @see {@link http://www.flickr.com/services/api/flickr.photosets.getInfo.html}
	 */
	this.getSetInfo = function(id, callback)
	{
		call('photosets.getInfo', 'photoset_id', id, function(r)
		{
			callback(r.photoset);
		});
	};

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
	 * Get photo context
	 * @param {String} id FlickrAPI photo ID
	 * @param {function(Array.<Flickr.MemberSet>)} callback
	 * @see {@link http://www.flickr.com/services/api/flickr.photos.getAllContexts.html}
	 */
	this.getContext = function(id, callback)
	{
		/** @var {Flickr.PhotoMembership} r */
		call('photos.getAllContexts', 'photo_id', id, function(r) { callback(r.set); });
	};

	/**
	 * Get photo context
	 * @param {String} id Flickr photo ID
	 * @param {function(Flickr.PhotoExif.photo)} callback
	 * @see {@link http://www.flickr.com/services/api/flickr.photos.getExif.html}
	 */
	this.getEXIF = function(id, callback)
	{
		call('photos.getExif', 'photo_id', id, function(r) { callback(r.photo); });
	};

	/**
	 * Get photo sizes
	 * @param {String} id Flickr photo ID
	 * @param {function(Flickr.Size)} callback Method to call when FlickrAPI responds
	 * @see {@link http://www.flickr.com/services/api/flickr.photos.getSizes.html}
	 */
	this.getSizes = function(id, callback)
	{
		call('photos.getSizes', 'photo_id', id, callback);
	};

	/**
	 * @param {function(String)} callback
	 */
	this.getRequestToken = function(callback)
	{
		_oauth.getOAuthRequestToken(function(error, token, tokenSecret, results)
		{
			if (error) { log.error(error); return; }

			// token and secret are both needed for the next call but token is
			// echoed back from the authorize service
			_tokenSecret = tokenSecret;
			callback(Format.string('{0}?oauth_token={1}', Setting.flickr.url.authorize, token));
		});
	};

	/**
	 *
	 * @param {String} token
	 * @param {String} verifier
	 * @param {function(string, string)} callback
	 */
	this.getAccessToken = function(token, verifier, callback)
	{
		_oauth.getOAuthAccessToken(token, _tokenSecret, verifier, function(error, accessToken, accessTokenSecret, accessResults)
		{
			_tokenSecret = null;

			if (error) { log.error(error); return; }

			callback(accessToken, accessTokenSecret);
		});
	};

	/**
	 * Setup standard parameters
	 * @param {String} method Name of flickr API method to call
	 * @param {String} [idType] The type of ID whether photo, set or other
	 * @param {String} [id] ID of the flickr object
	 * @param {Array.<String>} [extras] Additional fields to return
	 * @return {String}
	 */
	function parameterize(method, idType, id, extras)
	{
		var qs = '';
		var op = '?';
		var args =
		{
			'api_key': Setting.flickr.key,
			'format': 'json',
			'nojsoncallback': 1,
			'method': 'flickr.' + method
		};

		if (idType && id) { args[idType] = id; }
		if (extras) { args.extras = extras.toString(); }

		for (var k in args) { qs += op + k + '=' + args[k];	op = '&'; }

		return qs;
	}

	/**
	 * Examine token to ascertain authorization
	 * @return {Boolean}
	 */
	function isAuthorized()
	{
		if (_accessToken.isValid()) return true;
		else
		{
			if (_requestToken.isEmpty())					// need to request token (1)
				open(Enum.url.requestToken, null);
			else if (Format.isEmpty(_verifier))
				open(Enum.url.authorize, [['perms', 'read']]);  // validate request token (2)
			else		                                    // exchange validated token (3)
				open(Enum.url.accessToken, [['oauth_verifier', _verifier]]);

			return false;
		}
	}

	/**
	 * Open URL in a browser window
	 * @param {String} url Address to open
	 * @param {Array.<Array.<String>>} p Parameters to be signed along with the URL
	 */
	function open(url, p) { window.open(sign(url, null, p), '_blank'); }

	/**
	 * Add OAuth signature to URL
	 * @param {String} url Address of Flickr service
	 * @param {String} jsonCallName
	 * @param {Array.<Array.<String>>} p URL parameters
	 * @return {String} Signed URL
	 */
	function sign(url, jsonCallName, p)
	{
		p = p || [];
		p.push(["oauth_callback", 'http://localhost:81']);
		if (!Format.isEmpty(jsonCallName)) p.push(['jsoncallback', jsonCallName]);
		var message = { action: url, parameters: p };
		/** @type {Object.<String>} */
		var accessor = null;

		if (_accessToken.isValid())
		{
			accessor = {
				consumerKey: _consumerToken.key,
				consumerSecret: _consumerToken.secret,
				token: _accessToken.key,
				tokenSecret: _accessToken.secret
			}
		}
		else if (_requestToken.isEmpty())
		{
			// no access or request token yet
			accessor = { consumerKey: _consumerToken.key, consumerSecret: _consumerToken.secret };
		}
		else if (Format.isEmpty(_verifier))
		{
			// request token is valid but not verified yet
			accessor = { token: _requestToken.key };
		}
		else
		{
			// request token is valid and verified
			accessor = {
				consumerKey: _consumerToken.key,
				consumerSecret: _consumerToken.secret,
				token: _requestToken.key,
				tokenSecret: _requestToken.secret
			}
		}
		OAuth.completeRequest(message, accessor);
		//console.log(OAuth.SignatureMethod.getBaseString(message));
		return url + '?' + OAuth.formEncode(message.parameters);
	}
}

/**
 * @enum {String}
 * @const
 */
singleton.size =
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

/** @type {FlickrAPI} */
singleton.current = null;

/**
 * @param {String} key
 * @param {String} secret
 * @param {String} userID
 * @param {Function} [callback]
 */
singleton.make = function(key, secret, userID, callback)
{
	log.info('Constructing Flickr service');
	http.globalAgent.maxSockets = 200;
	singleton.current = new FlickrAPI(key, secret, userID);
	if (callback) { callback(); }
};

/**
 * @enum {String}
 * @const
 */
singleton.ExifSpace =
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

/**
 * Flickr token
 * @param {String} key
 * @param {String} secret
 * @constructor
 * @see http://www.flickr.com/services/api/auth.oauth.html
 */
function Token(key, secret)
{
	/** @type {String} */
	this.key = key;
	/** @type {String} */
	this.secret = secret;

	/** Whether key and secret are defined */
	this.isEmpty = function() {	return (Format.isEmpty(this.key) || Format.isEmpty(this.secret)); };
	this.isValid = function() { return (!this.isEmpty()); }
}


/** @see {@link http://nodejs.org/docs/latest/api/util.html#util_util_inherits_constructor_superconstructor} */
util.inherits(FlickrAPI, EventEmitter);

module.exports = singleton;
