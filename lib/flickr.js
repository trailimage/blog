'use strict';

const config = require('./config');
const log = require('./logger');
const cache = require('./cache');
const is = require('./is');
const e = require('./enum');
const format = require('./format');
const factory = require('./factory');
const retries = {};
const url = {
   requestToken: 'http://www.flickr.com/services/oauth/request_token',
   authorize: 'http://www.flickr.com/services/oauth/authorize',
   accessToken: 'http://www.flickr.com/services/oauth/access_token',
   photoSet: 'http://www.flickr.com/photos/trailimage/sets/'
};

// region Connectivity

/**
 * @param {Flickr.Response} r
 * @returns {boolean}
 */
const goodResponse = r => (is.value(r) && r.stat == 'ok');
const request = require('request');
const http = require('https');
const host = 'api.flickr.com';
const baseUrl = '/services/rest/';

http.globalAgent.maxSockets = 200;

/**
 * Execute Flickr service call
 * @param {String} method Name of Flickr API method to call
 * @param {String} idType Type of Flickr ID whether photo, set, collection, etc.
 * @param {String} id Flickr object ID
 * @param {function(Flickr.Response)} callback Method to call when service completes
 * @param {object.<String>} [args] Additional arguments
 * @see {@link http://www.flickr.com/services/api/response.json.html}
 * @private
 */
function call(method, idType, id, callback, args) {
   let callArgs = arguments;
   let options = {
      url: 'https://' + host + baseUrl + parameterize(method, idType, id, args),
      headers: { 'User-Agent': 'node.js' }
   };

   if (!is.empty(config.proxy)) { options.proxy = config.proxy; }

   request(options, (error, response, body) => {
      if (error === null) {
         sanitize(call, callArgs, body);
      } else {
         log.error('Calling %s resulted in %j', options.url, error.toString());
         retry(call, callArgs);
      }
   });
}

/**
 * Execute signed service call
 * @param {String} method Name of Flickr API method to call
 * @param {String} idType Type of Flickr ID whether photo, set, collection, etc.
 * @param {String} id FlickrAPI object ID
 * @param {function(Flickr.Response)} callback Method to call when service completes
 * @param {object.<String>} [args] Additional arguments
 * @see {@link http://www.flickr.com/services/api/response.json.html}
 * @private
 */
function signedCall(method, idType, id, callback, args) {
   let callArgs = arguments;
   let qs = parameterize(method, idType, id, args);
   let url = format.string('https://{0}{1}{2}', host, baseUrl, qs);

   this.oauth.get(url, options.auth.accessToken, options.auth.tokenSecret, (error, data) => {
      if (error != null) {
         log.error(error);
         retry(signedCall, callArgs);
      } else {
         sanitize(signedCall, callArgs, data);
      }
   });
}

/**
 * Parse Flickr response and handle different kinds of error conditions
 * @param {function(string, string, string, function, object)} fn Call to retry
 * @param {Array} args Original call arguments
 * @param {String} response
 */
function sanitize(fn, args, response) {
   let json = null;
   let method = args[0];
   let id = args[2];
   let callback = args[3];
   let abort = false;

   if (response) { response = response.replace(/\\'/g,"'"); }

   try {
      json = JSON.parse(response);

      if (json === null) {
         log.error('Call to %s with %s returned null', method, id);
      } else if (json.stat == 'fail') {
         log.error('%s when calling %s with %s (code %d)', json.message, method, id, json.code);
         // do not retry if the item is simply not found
         if (json.message.includes('not found')) { abort = true; }

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

   if (json === null && !abort) {
      retry(fn, args);
   } else {
      clearRetries(method, id);
      callback(json);
   }
}

/**
 * Retry service call if bad response and less than max retries
 * @param {function(string, string, string, function, object)} fn Call to retry
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

   if (count > this.options.maxRetries) {
      retries[key] = 0;
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
function clearRetries(method, id) {
   let key = method + '-' + id;
   if (is.defined(retries, key) && retries[key] > 0) {
      log.info('Call to %s with %s succeeded', method, id);
      retries[key] = 0;
   }
}

/**
 * Setup standard parameters
 * @param {String} method Name of flickr API method to call
 * @param {String} [idType] The type of ID whether photo, set or other
 * @param {String} [id] ID of the flickr object
 * @param {object.<string>} [args] Additional parameters
 * @returns {String}
 */
function parameterize(method, idType, id, args) {
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

// endregion
// region Tokens

/**
 * @param {function(String)} callback
 */
function getRequestToken(callback) {
   oauth.getOAuthRequestToken((error, token, secret) => {
      if (error) { log.error(error); return; }

      // token and secret are both needed for the next call but token is
      // echoed back from the authorize service
      this.options.auth.requestToken = token;
      this.options.auth.tokenSecret = secret;
      callback(format.string('{0}?oauth_token={1}', url.authorize, token));
   });
}

/**
 * @param {String} token
 * @param {String} verifier
 * @param {function(String, String, Date)} callback
 */
function getAccessToken(token, verifier, callback) {
   oauth.getOAuthAccessToken(token, this.options.auth.tokenSecret, verifier, (error, accessToken, accessTokenSecret) => {
      this.options.auth.tokenSecret = null;
      if (error) {
         log.error(error);
         callback(null, null, null);
      } else {
         callback(accessToken, accessTokenSecret, null);
      }
   });
}


// endregion
// region Library

/**
 * Load all sets as posts
 * @param {function(Object)} callback
 * @param {Object.<String>} [photoTags]
 */
function loadLibrary(callback, photoTags) {
   call('collections.getTree', 'user_id', config.flickr.userID, r => {
      if (goodResponse(r)) {
         const library = factory.buildLibrary(r.collections);
         // post addition uses full photo tag names supplied in this hash
         library.photoTags = is.value(photoTags) ? photoTags : {};
         // cache raw Flickr response
         cache.enqueue(r.collections);
         log.info('Loaded %d photo posts from Flickr: beginning detail retrieval', library.posts.length);
         callback(library);
         // continue asynchronous post load after callback
         loadAllPosts(library);
      } else {
         log.warn('Retrying in %d seconds', (config.flickr.retryDelay / e.time.second));
         setTimeout(() => { loadLibrary(callback, photoTags); }, config.flickr.retryDelay);
      }
   });
}

// endregion
// region Posts

/**
 * Creates new Post or updates an existing one
 * @param {String|Object} postOrID
 * @param {function(Object)} callback
 * @see http://www.flickr.com/services/api/flickr.photosets.getPhotos.html
 * @see http://www.flickr.com/services/api/flickr.photos.getInfo.html
 */
function loadPost(postOrID, callback) {
   let post = (typeof(postOrID) == is.type.OBJECT) ? postOrID : { id: postOrID };

   if (is.array(config.flickr.excludeSets) && config.flickr.excludeSets.indexOf(post.id) >= 0) {
      // post is excluded from the library
      callback(post);
   } else {
      loadPostInfo(post, p => { loadPostPhotos(p, callback); })
   }
}

/**
 * Asynchronously load details for all posts in library
 * @param {Object} library
 */
function loadAllPosts(library) {
   let pending = library.posts.length;

   for (let p of library.posts) {
      // begin an async call for each post
      loadPostInfo(p, post => {
         if (post === null) {
            // if no post info was found then assume post doesn't belong in library
            log.warn('Removing post %s from library', p.id);
            cache.dequeue(p.id);
         }
         if (--pending <= 0) {
            library.postInfoLoaded = true;
            // write raw provider data to cache
            cache.flush();
            log.info('Finished loading library posts');
         }
      });
   }
}

/**
 * Retrieve post information
 * @param {Object} post
 * @param {function(Object)} callback
 */
function loadPostInfo(post, callback) {
   if (post.infoLoaded) {
      callback(post);
   } else {
      call('photosets.getInfo', 'photoset_id', post.id, r => {
         if (is.value(r) && r.stat == 'ok') {
            const setInfo = r.photoset;
            // cache raw post data
            cache.queuePost(post.id, setInfo);
            factory.buildPostInfo(post, setInfo);
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
function loadPhotoPostID(photoID, callback) {
   call('photos.getAllContexts', 'photo_id', photoID, r => {
      callback(is.value(r) && is.array(r.set) ? r.set[0].id : null);
   });
}

// endregion
// region Photos

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

/**
 * Load and parse photo tags
 * @param {function(Flickr.TagSummary[])} callback
 */
function loadPhotoTags(callback) {
   signedCall('tags.getListUserRaw', null, null, r => {
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
 * Retrieve photo information for post
 * @param {Object} post
 * @param {function(Object)} callback
 */
function loadPostPhotos(post, callback) {
   if (post.photosLoaded) {
      // nothing more to do
      callback(post);
   } else {
      const options = {
         extras: factory.sizesForPost.concat(['description', 'tags', 'date_taken', 'geo', 'path_alias']).join()
      };

      call('photosets.getPhotos', 'photoset_id', post.id, r => {
         if (r === null) {
            log.error('getPhotos returned null for set %s', post.id);
         } else {
            factory.buildAllPostPhotos(post, r.photoset);
         }
         callback(post);
      }, options);
   }
}

/**
 * The documentation says signing is not required but results differ even with entirely
 * public photos -- perhaps a Flickr bug
 * @param {String[]|String} tags
 * @param {function(Object[])} callback
 */
function loadPhotosWithTags(tags, callback) {
   let options = {
      extras: factory.sizesForSearch.join(),
      tags: is.array(tags) ? tags.join() : tags,
      sort: sort.relevance,
      per_page: 500         // maximum
   };
   signedCall('photos.search', 'user_id', config.flickr.userID, r => {
         callback(is.value(r) ? r.photos.photo.map(p => factory.buildSearchPhoto(p, factory.sizesForSearch)) : null);
      },
      options);
}

/**
 * @param {String} photoID
 * @param {function(Object[])} callback
 */
function loadPhotoSizes(photoID, callback) {
   call('photos.getSizes', 'photo_id', photoID, callback);
}

/**
 * EXIF data for a single photo
 * @param {String} photoID Flickr photo ID
 * @param {function(Object)} callback
 * @see http://www.flickr.com/services/api/flickr.photos.getExif.html
 */
function loadExif(photoID, callback) {
   call('photos.getExif', 'photo_id', photoID, r => {
      callback(is.value(r) ? factory.buildExif(r.photo.exif) : null);
   });
}

// endregion

module.exports = {
   oauth: new OAuth(
      url.requestToken,
      url.accessToken,
      o.clientID,
      o.clientSecret,
      o.version,
      o.callback,
      o.encryption),

   loadLibrary,
   loadPhotoTags,
   loadPost,
   loadPhotoPostID,
   loadPhotosWithTags,
   loadExif
};