'use strict';

const re = require('../regex.js');
const cache = require('../cache.js');
const LibraryProvider = require('./library-provider');
const Photo = require('../models/photo.js');
const Post = require('../models/post.js');
const EXIF = require('../models/exif.js');
const is = require('../is.js');
const Enum = require('../enum.js');
const http = require('https');
const format = require('../format.js');
const setting = require('../settings.js');
const request = require('request');
const log = require('../log.js');
const host = 'api.flickr.com';
const baseUrl = '/services/rest/';

let retries = {};

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
 * @extends {EventEmitter}
 * @extends {LibraryProvider}
 */
class FlickrProvider extends LibraryProvider {
	constructor() {
		super();

		this.sizeCode.thumb = size.square150;
		this.sizeCode.preview = size.small240;
		this.sizeCode.fallbacks = [size.medium800, size.medium640];
		this.sizeCode.normal = size.large1024;
		this.sizeCode.big = size.large2048;

		log.info('Constructing Flickr service');
		http.globalAgent.maxSockets = 200;
	}

	/**
	 * EXIF data for a single photo
	 * @param {String} photoID Flickr photo ID
	 * @param {function(EXIF)} callback
	 * @see http://www.flickr.com/services/api/flickr.photos.getExif.html
	 */
	exif(photoID, callback) {
		call('photos.getExif', 'photo_id', photoID, function(r) {
			callback(is.value(r) ? EXIF.parse(r.photo.exif) : null);
		});
	}

	/**
	 * @param {function(Library)} callback
	 */
	_loadFromSource(callback) {
		call('collections.getTree', 'user_id', setting.flickr.userID, r => {
			if (is.value(r)) {
				const Library = require('../models/library.js');
				let library = Library.parse(r.collections);
				super._enqueue(r.collections);
				log.info('Loaded %d photo posts from Flickr: beginning detail retrieval', library.posts.length);
				callback(library);
				this._addPosts(library);
			} else {
				log.warn('Retrying in %d seconds', (setting.retryDelay / Enum.time.second));
				setTimeout(() => { this._loadFromSource(callback); }, setting.retryDelay);
			}
		});
	}

	/**
	 * @param {function(Flickr.Response)} callback
	 * @see {@link http://www.flickr.com/services/api/flickr.tags.getListUserRaw.html}
	 */
	photoTags(callback) {
		signedCall('tags.getListUserRaw', null, null, callback);
	}

	/**
	 * Creates new Post or updates an existing one
	 * @see http://www.flickr.com/services/api/flickr.photosets.getPhotos.html
	 * @see http://www.flickr.com/services/api/flickr.photos.getInfo.html
	 */
	getPost(postOrID, callback) {
		/** @type {Post} */
		let post = null;
		/** @type {String} */
		let id = null;

		if (postOrID instanceof Post) {
			post = postOrID;
			id = post.id;
		} else {
			id = postOrID;
		}

		let alsoGetInfo = (post === null || !post.infoLoaded);
		let options = {
			extras: Photo.sizesForPost.concat(['description', 'tags', 'date_taken', 'geo']).join()
		};

		call('photosets.getPhotos', 'photoset_id', id, r => {
			if (r === null) { callback(null); return; }    // error

			if (alsoGetInfo) {
				// make second call to get additional set information
				this.updatePostFields(post, callback);
			} else {
				callback(post);
			}
		}, options);
	}

	/**
	 *
	 * @param {String|Post} postOrID
	 * @param {function(Post)} callback
	 */
	updatePostFields(postOrID, callback) {
		/** @type {Post} */
		let post = null;
		/** @type {String} */
		let id = null;

		if (postOrID instanceof Post) {
			post = postOrID;
			id = post.id;
		} else {
			id = postOrID;
			post = new Post();
		}

		call('photosets.getInfo', 'photoset_id', id, r => {
			let info = r.photoset;
			// queue raw post data to be cached
			super._enqueuePost(id, info);
			this._parsePostFields(post, info);
			callback(post);
		});
	}

	/**
	 * @param {Post} post
	 * @param {Flickr.SetInfo} fields
	 * @private
	 */
	_parsePostFields(post, fields) {
		const lineBreak = /[\r\n]/g;

		post.video = parseVideoMetadata(fields);      // may also update info.description
		post.createdOn = format.parseTimeStamp(fields.date_create);
		post.updatedOn = format.parseTimeStamp(fields.date_update);
		post.photoCount = fields.photos;
		post.description = this.longDescription = fields.description._content.remove(lineBreak);
		// http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
		// http://farm{{info.farm}}.static.flickr.com/{{info.server}}/{{info.primary}}_{{info.secret}}.jpg'
		let thumb = `http://farm${fields.farm}.staticflickr.com/${fields.server}/${fields.primary}_${fields.secret}`;

		post.bigThumb = thumb + '.jpg';     // 500px
		post.smallThumb = thumb + '_s.jpg';
		post.infoLoaded = true;
	}

	/**
	 * @see http://www.flickr.com/services/api/flickr.photos.getAllContexts.html
	 */
	photoPostID(photoID, callback) {
		call('photos.getAllContexts', 'photo_id', photoID, r => {
			callback(is.value(r) && is.array(r.set) ? r.set[0].id : null);
		});
	}

	/**
	 * The documentation says signing is not required but results differ even with entirely
	 * public photos -- perhaps a Flickr bug
	 * @param {String[]|String} tags
	 * @param {function(Photo[])} callback
	 */
	photosWithTags(tags, callback) {
		let options = {
			extras: Photo.sizesForSearch.join(),
			tags: is.array(tags) ? tags.join() : tags,
			sort: exports.sort.relevance,
			per_page: 500         // maximum
		};
		signedCall('photos.search', 'user_id', setting.flickr.userID, r => {
			callback(is.value(r) ? r.photos.photo.map(p => Photo.parseThumb(p)) : null);
		},
		options);
	}

	/**
	 * @param {String} photoID
	 * @param {function(Size[])} callback
	 */
	photoSizes(photoID, callback) {
		call('photos.getSizes', 'photo_id', id, callback);
	}
}

// - Private members ----------------------------------------------------------

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

/**
 * Get YouTube ID and dimensions for video link
 * @param {Flickr.SetInfo} info
 */
function parseVideoMetadata(info) {
	let video = null;
	/** @type {String} */
	let d = info.description._content;

	if (re.video.test(d))	{
		let match = re.video.exec(d);
		video = { id: match[4], width: match[2], height: match[3] };
		// remove video link from description
		info.description._content = d.remove(match[0]).remove(/[\r\n\s]*$/);
	}
	return video;
}

module.exports = new FlickrProvider();