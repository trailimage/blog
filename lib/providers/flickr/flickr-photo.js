'use strict';

const TI = require('../../');
const config = TI.config;
const PhotoProviderBase = TI.Provider.Photo.Base;
const FlickrFactory = TI.Factory.Flickr;
const OAuth = TI.Auth.Helper;
const OAuthOptions = TI.Auth.Options;
const is = TI.is;
const Enum = TI.enum;
const format = TI.format;
const db = TI.active;
const request = require('request');
const extend = require('extend');
const http = require('https');

/**
 * @alias TI.Provider.Photo.Flickr
 * @extends PhotoProviderBase
 * @extends TI.Auth.Base
 */
class FlickrPhoto extends PhotoProviderBase {
	constructor(options) {
		super(new FlickrFactory());

		this.retries = {};
		/** @type defaultFlickrOptions */
		this.options = extend(true, defaultFlickrOptions, options);
		/** @type TI.Auth.Options */
		let o = this.options.auth;

		this.oauth = new OAuth(
			url.requestToken,
			url.accessToken,
			o.clientID,
			o.clientSecret,
			o.version,
			o.callback,
			o.encryption);

		if (is.array(this.options.featureSets)) {
			// exclude feature sets from normal position in collection
			if (!is.array(this.options.excludeSets)) { this.options.excludeSets = []; }
			this.options.excludeSets.concat(this.options.featureSets.map(s => s.id));
		}
		db.log.info('Constructing Flickr service');
		http.globalAgent.maxSockets = 200;
	}

	/**
	 * EXIF data for a single photo
	 * @param {String} photoID Flickr photo ID
	 * @param {function(TI.EXIF)} callback
	 * @see http://www.flickr.com/services/api/flickr.photos.getExif.html
	 */
	loadExif(photoID, callback) {
		this._call('photos.getExif', 'photo_id', photoID, r => {
			callback(is.value(r) ? this.factory.buildExif(r.photo.exif) : null);
		});
	}

	/**
	 * Load all posts from source if it wasn't available in the cache
	 * @param {function(TI.Library)} callback
	 * @param {Object.<String>} [photoTags]
	 * @private
	 */
	_loadLibraryFromSource(callback, photoTags) {
		this._call('collections.getTree', 'user_id', this.options.userID, r => {
			if (goodResponse(r)) {
				let library = this.factory.buildLibrary(r.collections, this.options.featureSets, this.options.excludeSets);
				// post addition uses full photo tag names supplied in this hash
				library.photoTags = is.value(photoTags) ? photoTags : {};
				// cache source data
				this.cache.enqueue(r.collections);
				db.log.info('Loaded %d photo posts from Flickr: beginning detail retrieval', library.posts.length);
				callback(library);
				// continue asynchronous post load after callback
				this.loadAllPosts(library);
			} else {
				db.log.warn('Retrying in %d seconds', (this.options.retryDelay / Enum.time.second));
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
				db.log.info('%d photo tags loaded from Flickr', tags.length);
				callback(tags);
			} else {
				db.log.warn('No photo tags returned from Flickr');
				callback(null);
			}
		});
	}

	/**
	 * Creates new Post or updates an existing one
	 * @param {String|TI.Post} postOrID
	 * @param {function(TI.Post)} callback
	 * @see http://www.flickr.com/services/api/flickr.photosets.getPhotos.html
	 * @see http://www.flickr.com/services/api/flickr.photos.getInfo.html
	 */
	loadPost(postOrID, callback) {
		/** @type TI.Post */
		let post = null;

		if (postOrID instanceof TI.Post) {
			post = postOrID;
		} else {
			post = new TI.Post();
			post.id = postOrID;
		}

		if (is.array(this.options.excludeSets) && this.options.excludeSets.indexOf(post.id) >= 0) {
			// this post is excluded from the library
			callback(post);
		} else {
			this.loadPostInfo(post, p => { this.loadPostPhotos(p, callback); })
		}
	}

	/**
	 * Retrieve photo information for post
	 * @param {TI.Post} post
	 * @param {function(TI.Post)} callback
	 */
	loadPostPhotos(post, callback) {
		if (post.photosLoaded) {
			// do nothing
			callback(post);
		} else {
			let options = {
				extras: this.factory.sizesForPost.concat(['description', 'tags', 'date_taken', 'geo', 'path_alias']).join()
			};

			this._call('photosets.getPhotos', 'photoset_id', post.id, r => {
				if (r === null) {
					db.log.error('getPhotos returned null for set %s', post.id);
				} else {
					this.factory.buildAllPostPhotos(post, r.photoset);
				}
				callback(post);
			}, options);
		}
	};

	/**
	 * Retrieve post information
	 * @param {TI.Post} post
	 * @param {function(TI.Post)} callback
	 */
	loadPostInfo(post, callback) {
		if (post.infoLoaded) {
			callback(post);
		} else {
			this._call('photosets.getInfo', 'photoset_id', post.id, r => {
				if (is.value(r) && r.stat == 'ok') {
					let setInfo = r.photoset;
					// cache raw post data
					this.cache.queuePost(post.id, setInfo);
					this.factory.buildPostInfo(post, setInfo);
				} else {
					db.log.error('Failed to getInfo for photoset %s', post.id);
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
	loadPhotoPostID(photoID, callback) {
		this._call('photos.getAllContexts', 'photo_id', photoID, r => {
			callback(is.value(r) && is.array(r.set) ? r.set[0].id : null);
		});
	}

	/**
	 * The documentation says signing is not required but results differ even with entirely
	 * public photos -- perhaps a Flickr bug
	 * @param {String[]|String} tags
	 * @param {function(TI.Photo[])} callback
	 */
	loadPhotosWithTags(tags, callback) {
		let options = {
			extras: this.factory.sizesForSearch.join(),
			tags: is.array(tags) ? tags.join() : tags,
			sort: sort.relevance,
			per_page: 500         // maximum
		};
		this._signedCall('photos.search', 'user_id', this.options.userID, r => {
			callback(is.value(r) ? r.photos.photo.map(p => this.factory.buildSearchPhoto(p, this.factory.sizesForSearch)) : null);
		},
		options);
	}

	/**
	 * @param {String} photoID
	 * @param {function(TI.PhotoSize[])} callback
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
			if (error) { db.log.error(error); return; }

			// token and secret are both needed for the next call but token is
			// echoed back from the authorize service
			this.options.auth.requestToken = token;
			this.options.auth.tokenSecret = secret;
			callback(format.string('{0}?oauth_token={1}', url.authorize, token));
		});
	};

	/**
	 *
	 * @param {String} token
	 * @param {String} verifier
	 * @param {function(String, String, Date)} callback
	 */
	getAccessToken(token, verifier, callback) {
		oauth.getOAuthAccessToken(token, this.options.auth.tokenSecret, verifier, (error, accessToken, accessTokenSecret) => {
			this.options.auth.tokenSecret = null;
			if (error) {
				db.log.error(error);
				callback(null, null, null);
			} else {
				callback(accessToken, accessTokenSecret, null);
			}
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

		if (!is.empty(config.proxy)) { options.proxy = config.proxy; }

		request(options, (error, response, body) => {
			if (error === null) {
				this._sanitize(this._call, callArgs, body);
			} else {
				db.log.error('Calling %s resulted in %j', options.url, error.toString());
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
		let url = format.string('https://{0}{1}{2}', host, baseUrl, qs);

		this.oauth.get(url, this.options.auth.accessToken, this.options.auth.tokenSecret, (error, data) => {
			if (error != null) {
				db.log.error(error);
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
		let abort = false;

		if (response) { response = response.replace(/\\'/g,"'"); }

		try {
			json = JSON.parse(response);

			if (json === null) {
				db.log.error('Call to %s with %s returned null', method, id);
			} else if (json.stat == 'fail') {
				db.log.error('%s when calling %s with %s (code %d)', json.message, method, id, json.code);
				// do not retry if the item is simply not found
				if (json.message.includes('not found')) { abort = true; }

				json = null;
			}
		} catch (ex) {
			db.log.error('Parsing call to %s with %s resulted in %s', method, id, ex.toString());

			if (/<html>/.test(response)) {
				// Flickr returned an HTML response instead of JSON -- likely an error message
				// see if we can swallow it
				db.log.error('Flickr returned HTML instead of JSON');
			}
			json = null;
		}

		if (json === null && !abort) {
			this._retry(fn, args);
		} else {
			this._clearRetries(method, id);
			callback(json);
		}
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
			db.log.error('Call to %s with %s failed after %s tries', method, id, this.options.maxRetries);
			callback(null);
		} else {
			db.log.warn('Retry %s for %s with %s', count, method, id);
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
			db.log.info('Call to %s with %s succeeded', method, id);
			this.retries[key] = 0;
		}
	}

	/**
	 * Setup standard parameters
	 * @param {String} method Name of flickr API method to call
	 * @param {String} [idType] The type of ID whether photo, set or other
	 * @param {String} [id] ID of the flickr object
	 * @param {Object.<String>} [args] Additional parameters
	 * @returns {String}
	 * @private
	 */
	_parameterize(method, idType, id, args) {
		let qs = '';
		let op = '?';

		if (!is.value(args)) { args = {}; }

		args.api_key = this.options.auth.consumerKey;
		args.format = 'json';
		args.nojsoncallback = 1;
		args.method = 'flickr.' + method;

		if (is.value(idType) && is.value(id)) { args[idType] = id; }

		for (let k in args) { qs += op + k + '=' + encodeURIComponent(args[k]); op = '&'; }

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

/**
 * @see https://www.flickr.com/services/api/flickr.photos.search.html
 * @type {Object.<String>}
 */
const sort = {
	datePosted: 'date-posted-asc',
	datePostedReverse: 'date-posted-desc',
	dateTaken: 'date-taken-asc',
	dateTakenReverse: 'date-taken-desc',
	interestingness: 'interestingness-asc',
	interestingnessReverse: 'interestingness-desc',
	relevance: 'relevance'
};

const defaultFlickrOptions = {
	/** @type String */
	userID: null,
	/** @type String */
	appID: null,
	/** @type Number */
	maxRetries: 10,
	/** @type Number */
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
	/** @type Boolean */
	useCache: true,
	/** @type TI.Auth.Options */
	auth: new OAuthOptions(1)
};

/**
 * @param {Flickr.Response} r
 * @returns {Boolean}
 */
function goodResponse(r) {	return (is.value(r) && r.stat == 'ok'); }

module.exports = FlickrPhoto;