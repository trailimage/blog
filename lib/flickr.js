'use strict';

const config = require('./config');
const log = require('./logger');
const is = require('./is');
const format = require('./format');
const factory = require('./factory');
const retries = {};
const type = { USER: 'user_id', SET: 'photoset_id', PHOTO: 'photo_id' };
const url = {
   base: '/services/rest/',
   requestToken: 'http://www.flickr.com/services/oauth/request_token',
   authorize: 'http://www.flickr.com/services/oauth/authorize',
   accessToken: 'http://www.flickr.com/services/oauth/access_token',
   photoSet: 'http://www.flickr.com/photos/trailimage/sets/'
};

// region Connectivity

const request = require('request');
const host = 'api.flickr.com';
const defaultCallOptions = {
   // method to retrieve value from JSON response
   value: r => r,
   // error message to log if call fails
   error: null,
   // whether to OAuth sign the request
   sign: false,
   // additional querystring arguments
   args: {}
};

require('https').globalAgent.maxSockets = 200;

/**
 * Execute service call
 * @param {String} method Name of Flickr API method to call
 * @param {String} idType Type of Flickr ID whether photo, set, collection, etc.
 * @param {String} id FlickrAPI object ID
 * @param {Object} [options]
 * @returns {Promise}
 * @see http://www.flickr.com/services/api/response.json.html
 */
function call(method, idType, id, options = {}) {
   options = Object.assign({}, defaultCallOptions, options);
   // create key to track retries and log messages
   const key = method + '(' + id + ')';
   const http = {
      url: 'https://' + host + url.base + parameterize(method, idType, id, options.args),
      headers: { 'User-Agent': 'node.js' }
   };

   return new Promise((resolve, reject) => {
      // response handler that may retry call
      const handle = (error, body, attempt) => {
         let tryAgain = false;
         if (error === null) {
            const json = parse(body, key);
            if (json.stat == 'ok') {
               clearRetries(key);
               resolve(options.value(json));
            } else {
               tryAgain = json.retry;
            }
         } else {
            log.error('Calling %s resulted in %j', http.url, error.toString());
            tryAgain = true;
         }
         if (!tryAgain || (tryAgain && !retry(attempt, key))) {
            reject(options.error);
         }
      };

      if (options.sign) {
         const token = config.flickr.auth.token;
         const attempt = () => oauth.get(http.url, token.access, token.secret, (error, body) => {
            handle(error, body, attempt);
         });
      } else {
         const attempt = () => request(http, (error, response, body) => {
            handle(error, body, attempt);
         });
      }
   });
}

/**
 * Parse Flickr response and handle different kinds of error conditions
 * @param {String} body
 * @param {String} key
 * @returns {Flickr.Response}
 */
function parse(body, key) {
   const fail = { retry: true, stat: 'fail' };
   let json = null;

   if (body) { body = body.replace(/\\'/g,"'"); }

   try {
      json = JSON.parse(body);

      if (json === null) {
         log.error('Call to %s returned null', key);
         json = fail;
      } else if (json.stat == 'fail') {
         log.error('%s when calling %s [code %d]', json.message, key, json.code);
         // do not retry if the item is simply not found
         if (json.message.includes('not found')) { json.retry = false; }
      }
   } catch (ex) {
      log.error('Parsing call to %s resulted in %s', key, ex.toString());

      if (/<html>/.test(body)) {
         // Flickr returned an HTML response instead of JSON -- likely an error message
         // see if we can swallow it
         log.error('Flickr returned HTML instead of JSON');
      }
      json = fail;
   }
   return json;
}

/**
 * Retry service call if bad response and less than max retries
 * @param {function} fn Call to retry
 * @param {String} key
 * @return {Boolean} whether call could be retried
 */
function retry(fn, key) {
   let count = 1;

   if (is.defined(retries, key)) { count = ++retries[key]; } else { retries[key] = count; }

   if (count > config.flickr.maxRetries) {
      retries[key] = 0;
      log.error('Call to %s failed after %s tries', key, config.flickr.maxRetries);
      return false;
   } else {
      log.warn('Retry %s for %s', count, key);
      setTimeout(fn, config.flickr.retryDelay);
      return true;
   }
}

/**
 * Clear retry count and log success
 * @param {String} key
 */
function clearRetries(key) {
   if (is.defined(retries, key) && retries[key] > 0) {
      log.info('Call to %s succeeded', key);
      retries[key] = 0;
   }
}

/**
 * Setup standard parameters
 * @param {String} method Name of flickr API method to call
 * @param {String} [idType] The type of ID whether photo, set or other
 * @param {String} [id] ID of the flickr object
 * @param {Object} [args] Additional parameters
 * @returns {String}
 */
function parameterize(method, idType, id, args = {}) {
   let qs = '';
   let op = '?';

   args.api_key = config.flickr.auth.apiKey;
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
   const token = config.flickr.auth.token;
   oauth.getOAuthRequestToken((error, t, secret) => {
      if (error) { log.error(error); return; }
      // token and secret are both needed for the next call but token is
      // echoed back from the authorize service
      token.request = t;
      token.secret = secret;
      callback(format.string('{0}?oauth_token={1}', url.authorize, t));
   });
}

/**
 * @param {String} requestToken
 * @param {String} verifier
 * @param {function(String, String, Date)} callback
 */
function getAccessToken(requestToken, verifier, callback) {
   const token = config.flickr.auth.token;
   oauth.getOAuthAccessToken(requestToken, token.secret, verifier, (error, accessToken, accessTokenSecret) => {
      token.secret = null;
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
 * @return {Promise}
 */
const collections = () => call('collections.getTree', type.USER, config.flickr.userID, {

});


// /**
//  * Load all sets as posts
//  * @param {function(Object)} callback
//  * @param {Object.<String>} [photoTags]
//  */
// function loadLibrary(callback, photoTags) {
//    call('collections.getTree', 'user_id', config.flickr.userID, r => {
//       if (goodResponse(r)) {
//          const library = factory.buildLibrary(r.collections);
//          // post addition uses full photo tag names supplied in this hash
//          library.photoTags = is.value(photoTags) ? photoTags : {};
//          // cache raw Flickr response
//          cache.enqueue(r.collections);
//          log.info('Loaded %d photo posts from Flickr: beginning detail retrieval', library.posts.length);
//          callback(library);
//          // continue asynchronous post load after callback
//          loadAllPosts(library);
//       } else {
//          log.warn('Retrying in %d seconds', (config.flickr.retryDelay / e.time.second));
//          setTimeout(() => { loadLibrary(callback, photoTags); }, config.flickr.retryDelay);
//       }
//    });
// }

// endregion
// region Sets


// /**
//  * Creates new Post or updates an existing one
//  * @param {String|Object} postOrID
//  * @param {function(Object)} callback
//  * @see http://www.flickr.com/services/api/flickr.photosets.getPhotos.html
//  * @see http://www.flickr.com/services/api/flickr.photos.getInfo.html
//  */
// function loadPost(postOrID, callback) {
//    let post = (typeof(postOrID) == is.type.OBJECT) ? postOrID : { id: postOrID };
//
//    if (is.array(config.flickr.excludeSets) && config.flickr.excludeSets.indexOf(post.id) >= 0) {
//       // post is excluded from the library
//       callback(post);
//    } else {
//       loadPostInfo(post, p => { loadPostPhotos(p, callback); })
//    }
// }

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
 *
 * @param {String} id
 * @returns {Promise}
 */
const setInfo = id => call('photosets.getInfo', type.SET, id, {
   error: 'Failed to getInfo for photoset ' + id,
   value: r => r.photoset
});


/**
 *
 * @param {String} id
 * @returns {Promise}
 */
const setPhotos = id => call('photosets.getPhotos', type.SET, id, {
   args: {
      extras: factory.sizesForPost.concat(['description', 'tags', 'date_taken', 'geo', 'path_alias']).join()
   },
   error: 'getPhotos returned null for set ' + id,
   value: r => r.photoset
});


/**
 * Posts that contain photo
 * @param {String} id
 * @returns {Promise}
 * @see http://www.flickr.com/services/api/flickr.photos.getAllContexts.html
 */
const photoContext = id => call('photos.getAllContexts', type.PHOTO, id, {
   value: r => r.set
});


// /**
//  * Retrieve post information
//  * @param {Object} post
//  * @param {function(Object)} callback
//  */
// function loadPostInfoOld(post, callback) {
//    if (post.infoLoaded) {
//       callback(post);
//    } else {
//       call('photosets.getInfo', 'photoset_id', post.id, r => {
//          if (is.value(r) && r.stat == 'ok') {
//             const setInfo = r.photoset;
//             // cache raw post data
//             cache.queuePost(post.id, setInfo);
//             factory.buildPostInfo(post, setInfo);
//          } else {
//             log.error('Failed to getInfo for photoset %s', post.id);
//          }
//          callback(post);
//       });
//    }
// }

// /**
//  * Identify post containing given photo
//  * @param {String} photoID
//  * @param {function(String)} callback
//  * @see http://www.flickr.com/services/api/flickr.photos.getAllContexts.html
//  */
// function loadPhotoPostID(photoID, callback) {
//    call('photos.getAllContexts', 'photo_id', photoID, r => {
//       callback(is.value(r) && is.array(r.set) ? r.set[0].id : null);
//    });
// }

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
 * Photo tags for user
 * @returns {Promise}
 */
const photoTags = () => call('tags.getListUserRaw', type.USER, config.flickr.userID, {
   error: 'No photo tags returned from Flickr',
   value: r => r.who.tags.tag,
   sign: true
});

/**
 * Load and parse photo tags
 * @returns {Promise}
 */
const postPhotos = id => call('photosets.getPhotos', type.SET, id, {
   error: 'getPhotos returned null for set ' + id,
   value: r => r.photoset,
   args: {
      extras: factory.sizesForPost.concat(['description', 'tags', 'date_taken', 'geo', 'path_alias']).join()
   }
});

/**
 * The documentation says signing is not required but results differ even with entirely
 * public photos -- perhaps a Flickr bug
 * @param {String[]|String} tags
 * @returns {Promise}
 */
const photoSearch = tags => call('photos.search', type.USER, config.flickr.userID, {
   args: {
      extras: factory.sizesForSearch.join(),
      tags: is.array(tags) ? tags.join() : tags,
      sort: sort.relevance,
      per_page: 500         // maximum
   },
   signed: true,
   value: r => r.photos.photo
});

/**
 * @param {String} id
 * @returns {Promise}
 */
const photoSizes = id => call('photos.getSizes', type.PHOTO, id);

/**
 * EXIF data for a single photo
 * @param {String} id Flickr photo ID
 * @returns {Promise}
 * @see http://www.flickr.com/services/api/flickr.photos.getExif.html
 */
const exif = id => call('photos.getExif', type.PHOTO, id, {
   value: r => r.photo.exif
});


// endregion

module.exports = {
   collections,
   setInfo,
   photoSizes,
   photoSearch,
   exif
};