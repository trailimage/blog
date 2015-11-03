'use strict';

const re = require('../../regex.js');
const DataBase = require('./../data-base');
const FlickrFactory = require('./flickr-factory.js');
const OAuth = require('../../oauth.js');
const is = require('../../is.js');
const Enum = require('../../enum.js');
const http = require('https');
const format = require('../../format.js');
const request = require('request');
const extend = require('extend');
const log = require('../../config.js').provider.log;

/**
 * @extends {EventEmitter}
 * @extends {DataBase}
 */
class FlickrData extends DataBase {
	constructor(options) {
		super(new FlickrFactory());

		this.retries = {};
		/** @type {defaultOptions} */
		this.options = extend(true, defaultOptions, options);
		this.sizeField.thumb = size.square150;
		this.sizeField.preview = size.small320;
		this.sizeField.fallbacks = [size.medium800, size.medium640];
		this.sizeField.normal = size.large1024;
		this.sizeField.big = size.large2048;
		this.oauth = new OAuth(
			url.requestToken,
			url.accessToken,
			this.options.key,
			this.options.secret,
			this.options.oauth.version,
			this.options.oauth.url,
			this.options.oauth.encryption);

		if (is.array(this.options.featureSets)) {
			// exclude feature sets from normal position in collection
			if (!is.array(this.options.excludeSets)) { this.options.excludeSets = []; }
			this.options.excludeSets.concat(this.options.featureSets.map(s => s.id));
		}
		log.info('Constructing Flickr service');
		http.globalAgent.maxSockets = 200;
	}

	/**
	 * EXIF data for a single photo
	 * @param {String} photoID Flickr photo ID
	 * @param {function(EXIF)} callback
	 * @see http://www.flickr.com/services/api/flickr.photos.getExif.html
	 */
	loadExif(photoID, callback) {
		this._call('photos.getExif', 'photo_id', photoID, function(r) {
			callback(is.value(r) ? this.factory.buildExif(r.photo.exif) : null);
		});
	}

	/**
	 * Load all posts from source if it wasn't available in the cache
	 * @param {function(Library)} callback
	 * @param {Object.<String>} [photoTags]
	 * @private
	 */
	_loadLibraryFromSource(callback, photoTags) {
		this._call('collections.getTree', 'user_id', this.options.userID, r => {
			if (is.value(r) && r.stat == 'ok') {
				let library = this.factory.buildLibrary(r.collections, this.options.featureSets);
				// post addition uses full photo tag names supplied in this hash
				library.photoTags = is.value(photoTags) ? photoTags : {};
				// cache source data
				this.cache.enqueue(r.collections);
				log.info('Loaded %d photo posts from Flickr: beginning detail retrieval', library.posts.length);
				callback(library);
				// continue asynchronous post load after callback
				this.loadAllPosts(library);
			} else {
				log.warn('Retrying in %d seconds', (this.options.retryDelay / Enum.time.second));
				setTimeout(() => { this._loadLibraryFromSource(callback, photoTags); }, this.options.retryDelay);
			}
		});
	}

	/**
	 * Load and parse photo tags
	 * @param {function(Flickr.TagSummary[])} callback
	 * @private
	 */
	_loadPhotoTagsFromSource(callback) {
		this._signedCall('tags.getListUserRaw', null, null, r => {
			if (goodResponse(r)) {
				let tags = r.who.tags.tag;
				log.info('%d photo tags loaded from Flickr', tags.length);
				callback(tags);
			} else {
				log.warn('No photo tags returned from Flickr');
				callback(null);
			}
		});
	}

	/**
	 * Creates new Post or updates an existing one
	 * @see http://www.flickr.com/services/api/flickr.photosets.getPhotos.html
	 * @see http://www.flickr.com/services/api/flickr.photos.getInfo.html
	 */
	loadPost(postOrID, callback) {
		/** @type {Post} */
		let post = null;

		if (postOrID instanceof Post) {
			post = postOrID;
		} else {
			post = new Post();
			post.id = postOrID;
		}

		this.loadPostInfo(post, p => { this.loadPostPhotos(p, callback); })
	}

	/**
	 * Retrieve photo information for post
	 * @param {Post} post
	 * @param {function(Post)} callback
	 */
	loadPostPhotos(post, callback) {
		if (post.photosLoaded) {
			// do nothing
			callback(post);
		} else {
			let options = {
				extras: this.sizesForPost.concat(['description', 'tags', 'date_taken', 'geo']).join()
			};

			this._call('photosets.getPhotos', 'photoset_id', post.id, r => {
				if (r === null) {
					log.error('getPhotos returned null for set %s', post.id);
				} else {
					this.factory.buildAllPostPhotos(post, r.photoset);
				}
				callback(post);
			}, options);
		}
	};

	/**
	 * Retrieve post information
	 * @param {Post} post
	 * @param {function(Post)} callback
	 */
	loadPostInfo(post, callback) {
		if (post.infoLoaded) {
			callback(post);
		} else {
			this._call('photosets.getInfo', 'photoset_id', post.id, r => {
				if (is.value(r) && r.stat == 'ok') {
					let setInfo = r.photoset;
					// queue raw post data to be cached
					this.cache.queuePost(post.id, setInfo);
					this.factory.buildPostInfo(post, setInfo);
				} else {
					log.error('Failed to getInfo for photoset %s', post.id);
				}
				callback(post);
			});
		}
	}

	/**
	 * Identify post containing given photo
	 * @param {String} photoID
	 * @param {function(String)} callback
	 * @see http://www.flickr.com/services/api/flickr.photos.getAllContexts.html
	 */
	photoPostID(photoID, callback) {
		this._call('photos.getAllContexts', 'photo_id', photoID, r => {
			callback(is.value(r) && is.array(r.set) ? r.set[0].id : null);
		});
	}

	/**
	 * The documentation says signing is not required but results differ even with entirely
	 * public photos -- perhaps a Flickr bug
	 * @param {String[]|String} tags
	 * @param {function(Photo[])} callback
	 */
	loadPhotosWithTags(tags, callback) {
		let options = {
			extras: this.sizesForSearch.join(),
			tags: is.array(tags) ? tags.join() : tags,
			sort: exports.sort.relevance,
			per_page: 500         // maximum
		};
		this._signedCall('photos.search', 'user_id', this.options.userID, r => {
			callback(is.value(r) ? r.photos.photo.map(p => this.factory.buildSearchPhoto(p, this.sizeField.thumb)) : null);
		},
		options);
	}

	/**
	 * @param {String} photoID
	 * @param {function(Size[])} callback
	 */
	loadPhotoSizes(photoID, callback) {
		this._call('photos.getSizes', 'photo_id', id, callback);
	}

// - Tokens -------------------------------------------------------------------

	/**
	 * @param {function(String)} callback
	 */
	getRequestToken(callback) {
		oauth.getOAuthRequestToken((error, token, secret) => {
			if (error) { log.error(error); return; }

			// token and secret are both needed for the next call but token is
			// echoed back from the authorize service
			this.tokenSecret = secret;
			callback(format.string('{0}?oauth_token={1}', url.authorize, token));
		});
	};

	/**
	 *
	 * @param {String} token
	 * @param {String} verifier
	 * @param {function(string, string)} callback
	 */
	getAccessToken(token, verifier, callback) {
		oauth.getOAuthAccessToken(token, this.options.tokenSecret, verifier, (error, accessToken, accessTokenSecret) => {
			this.options.tokenSecret = null;
			if (error) { log.error(error); return; }
			callback(accessToken, accessTokenSecret);
		});
	};


// - Private methods ----------------------------------------------------------

	/**
	 * Execute Flickr service call
	 * @param {String} method Name of Flickr API method to call
	 * @param {String} idType Type of Flickr ID whether photo, set, collection, etc.
	 * @param {String} id Flickr object ID
	 * @param {function(Flickr.Response)} callback Method to call when service completes
	 * @param {Object.<String>} [args] Additional arguments
	 * @see {@link http://www.flickr.com/services/api/response.json.html}
	 * @private
	 */
	_call(method, idType, id, callback, args) {
		let callArgs = arguments;
		let options = {
			url: 'https://' + host + baseUrl + this._parameterize(method, idType, id, args),
			headers: { 'User-Agent': 'node.js' }
		};

		if (!is.empty(this.options.proxy)) { options.proxy = this.options.proxy; }

		request(options, (error, response, body) => {
			if (error === null) {
				this._sanitize(this._call, callArgs, body);
			} else {
				log.error('Calling %s resulted in %j', options.path, error.toString());
				this._retry(this._call, callArgs);
			}
		});
	}

	/**
	 * Execute signed service call
	 * @param {String} method Name of Flickr API method to call
	 * @param {String} idType Type of Flickr ID whether photo, set, collection, etc.
	 * @param {String} id FlickrAPI object ID
	 * @param {function(Flickr.Response)} callback Method to call when service completes
	 * @param {Object.<String>} [args] Additional arguments
	 * @see {@link http://www.flickr.com/services/api/response.json.html}
	 * @private
	 */
	_signedCall(method, idType, id, callback, args) {
		let callArgs = arguments;
		let qs = this._parameterize(method, idType, id, args);
		let url = format.string('https://{0}/{1}{2}', host, baseUrl, qs);

		this.oauth.get(url, this.options.token, this.options.tokenSecret, (error, data) => {
			if (error) {
				log.error(error);
				this._retry(this._signedCall, callArgs);
			} else {
				this._sanitize(this._signedCall, callArgs, data);
			}
		});
	}

	/**
	 * Parse Flickr response and handle different kinds of error conditions
	 * @param {function(String, String, String, function, object)} fn Call to retry
	 * @param {Array} args Original call arguments
	 * @param {String} response
	 */
	_sanitize(fn, args, response) {
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

		if (json === null) { this._retry(fn, args); } else { this._clearRetries(method, id); callback(json);	}
	}

	/**
	 * Retry service call if bad response and less than max retries
	 * @param {function(String, String, String, function, object)} fn Call to retry
	 * @param {Array} args Original call arguments
	 */
	_retry(fn, args) {
		let count = 1;
		let method = args[0];
		let id = args[2];
		let callback = args[3];
		let key = method + '-' + id;
		let scope = this;

		if (is.defined(this.retries, key)) { count = ++this.retries[key]; } else { this.retries[key] = count; }

		if (count > this.options.maxRetries) {
			this.retries[key] = 0;
			log.error('Call to %s with %s failed after %s tries', method, id, this.options.maxRetries);
			callback(null);
		} else {
			log.warn('Retry %s for %s with %s', count, method, id);
			setTimeout(() => { fn.apply(scope, args); }, this.options.retryDelay);
		}
	}

	/**
	 * Clear retry count and log success
	 * @param {String} method
	 * @param {String} id
	 */
	_clearRetries(method, id) {
		let key = method + '-' + id;

		if (is.defined(this.retries, key) && this.retries[key] > 0) {
			log.info('Call to %s with %s succeeded', method, id);
			this.retries[key] = 0;
		}
	}

	/**
	 * Setup standard parameters
	 * @param {String} method Name of flickr API method to call
	 * @param {String} [idType] The type of ID whether photo, set or other
	 * @param {String} [id] ID of the flickr object
	 * @param {Object.<String>} [args] Additional parameters
	 * @return {String}
	 * @private
	 */
	_parameterize(method, idType, id, args) {
		let qs = '';
		let op = '?';

		if (!is.value(args)) { args = {}; }

		args.api_key = this.options.key;
		args.format = 'json';
		args.nojsoncallback = 1;
		args.method = 'flickr.' + method;

		if (idType && id) { args[idType] = id; }

		for (let k in args) { qs += op + k + '=' + args[k]; op = '&'; }

		return qs;
	}
}

// - Private static members ---------------------------------------------------

const host = 'api.flickr.com';
const baseUrl = '/services/rest/';

const url = {
	requestToken: 'http://www.flickr.com/services/oauth/request_token',
	authorize: 'http://www.flickr.com/services/oauth/authorize',
	accessToken: 'http://www.flickr.com/services/oauth/access_token',
	photoSet: 'http://www.flickr.com/photos/trailimage/sets/'
};

const defaultOptions = {
	/** @type {String} */
	key: null,
	/** @type {String} */
	userID: null,
	/** @type {String} */
	appID: null,
	/** @type {String} */
	secret: null,
	/** @type {String} */
	token: null,
	/** @type {String} */
	tokenSecret: null,
	/** @type {Number} */
	maxRetries: 10,
	/** @type {Number} */
	retryDelay: 300,
	/**
	 * id and title of posts to manually add to root collection
	 * @type {FeatureSet[]}
	 */
	featureSets: [],
	/**
	 * list of set IDs to exclude
	 * @type {String[]}
	 */
	excludeSets: [],
	/**
	 * List of photo tags to exclude
	 * @type {String[]}
	 */
	excludeTags: [],
	/** @type {Boolean} */
	useCache: true,
	/**
	 * @see https://github.com/ciaranj/node-oauth
	 */
	oauth: {
		version: '1.0A',
		encryption: 'HMAC-SHA1',
		/**
		 * Callback URL for OAuth call
		 * @type {String}
		 */
		url: null
	}
};

/**
 * Flickr size tokens
 * @enum {String}
 * @const
 */
const size = {
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
 * @param {Flickr.Response} r
 * @returns {Boolean}
 */
function goodResponse(r) {	return (is.value(r) && r.stat == 'ok'); }

module.exports = FlickrData;