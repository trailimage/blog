const config = require('./config');
const log = require('./logger');
const is = require('./is');
const util = require('./util');
const cache = require('./cache');
const type = { USER: 'user_id', SET: 'photoset_id', PHOTO: 'photo_id' };
const url = {
   base: '/services/rest/',
   requestToken: 'http://www.flickr.com/services/oauth/request_token',
   authorize: 'http://www.flickr.com/services/oauth/authorize',
   accessToken: 'http://www.flickr.com/services/oauth/access_token',
   photoSet: 'http://www.flickr.com/photos/trailimage/sets/'
};
const method = {
   COLLECTIONS: 'collections.getTree',
   photo: {
      EXIF: 'photos.getExif',
      SEARCH: 'photos.search',
      SETS: 'photos.getAllContexts',
      SIZES: 'photos.getSizes',
      TAGS: 'tags.getListUserRaw'
   },
   set: {
      INFO: 'photosets.getInfo',
      PHOTOS: 'photosets.getPhotos'
   }
};
const extra = {
   DESCRIPTION: 'description',
   TAGS: 'tags',
   DATE_TAKEN: 'date_taken',
   LOCATION: 'geo',
   PATH_ALIAS: 'path_alias'
};

// region Connectivity

const retries = {};
const fetch = require('node-fetch');
const host = 'api.flickr.com';
const OAuth = require('oauth').OAuth;
const oauth = new OAuth(
   url.requestToken,
   url.accessToken,
   config.flickr.auth.apiKey,
   config.flickr.auth.secret,
   '1.0A',
   config.flickr.auth.callback,
   'HMAC-SHA1');
const defaultCallOptions = {
   // method to retrieve value from JSON response
   value: r => r,
   // error message to log if call fails
   error: null,
   // whether to OAuth sign the request
   sign: false,
   // whether result can be cached (subject to global configuration)
   allowCache: false,
   // additional querystring arguments
   args: {}
};

require('https').globalAgent.maxSockets = 200;

/**
 * Load response from cache or call API
 * @param {String} method Name of Flickr API method to call
 * @param {String} idType Type of Flickr ID whether photo, set, collection, etc.
 * @param {String} id FlickrAPI object ID
 * @param {FlickrOptions|Object} [options]
 * @returns {Promise.<Flickr.Response>}
 */
function call(method, idType, id, options = {}) {
   options = Object.assign({}, defaultCallOptions, options);
   // generate fallback API call
   const noCache = ()=> callAPI(method, idType, id, options);

   return (config.cache.json && options.allowCache)
      ? cache.getItem(method, id)
         .then(item => is.value(item) ? item : noCache())
         .catch(err => {
            log.error('Error getting Flickr %s:%s from cache: %j', method, id, err);
            return noCache();
         })
      : noCache();
}

/**
 * Invoke API when method result isn't cached
 * @param {String} method
 * @param {String} idType
 * @param {String} id
 * @param {FlickrOptions|Object} options
 * @returns {Promise.<Flickr.Response>}
 * @see http://www.flickr.com/services/api/response.json.html
 */
function callAPI(method, idType, id, options) {
   // create key to track retries and log messages
   const key = method + ':' + id;
   const methodUrl = 'https://' + host + url.base + parameterize(method, idType, id, options.args);

   return new Promise((resolve, reject) => {
      const token = config.flickr.auth.token;
      // response handler that may retry call
      const handler = (err, body, attempt) => {
         let tryAgain = false;
         if (err === null) {
            const json = parse(body, key);
            if (json.stat == 'ok') {
               clearRetries(key);
               const parsed = options.value(json);
               resolve(parsed);
               // cache result
               if (config.cache.json && options.allowCache) { cache.add(method, id, parsed); }
            } else {
               tryAgain = json.retry;
            }
         } else {
            log.error('Calling %s resulted in %j', methodUrl, err);
            tryAgain = true;
         }
         if (!tryAgain || (tryAgain && !retry(attempt, key))) {
            reject('Flickr ' + method + ' failed for ' + idType + ' ' + id);
         }
      };
      // create call attempt with signing as required
      const attempt = options.sign
         ? () => oauth.get(methodUrl, token.access, token.secret, (error, body) => {
            handler(error, body, attempt);
         })
         : () => fetch(methodUrl, { headers: { 'User-Agent': 'node.js' }})
         .then(res => res.text())
         .then(body => { handler(null, body, attempt); })
         .catch(err => { handler(err, null, attempt); });

      attempt();
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

   if (is.value(body)) { body = body.replace(/\\'/g, '\''); }

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
   for (const k in args) { qs += op + k + '=' + encodeURIComponent(args[k]); op = '&'; }
   return qs;
}

// endregion

module.exports = {
   /**
    * Return cache keys to support invalidation
    */
   cache: {
      keysForPost: [method.set.INFO, method.set.PHOTOS],
      keysForPhoto: [method.photo.SIZES],
      keysForLibrary: [method.COLLECTIONS, method.photo.TAGS]
   },
   /**
    * @returns {Promise}
    */
   getRequestToken() {
      const token = config.flickr.auth.token;
      return new Promise((resolve, reject) => {
         oauth.getOAuthRequestToken((error, t, secret) => {
            if (is.value(error)) {
               reject(error);
            } else {
               // token and secret are both needed for the next call but token is
               // echoed back from the authorize service
               token.request = t;
               token.secret = secret;
               resolve(util.format('{0}?oauth_token={1}', url.AUTHORIZE, t));
            }
         });
      });
   },

   /**
    * @param {String} requestToken
    * @param {String} verifier
    * @returns {Promise}
    */
   getAccessToken(requestToken, verifier) {
      const token = config.flickr.auth.token;
      return new Promise((resolve, reject) => {
         oauth.getOAuthAccessToken(requestToken, token.secret, verifier, (error, accessToken, accessTokenSecret) => {
            token.secret = null;
            if (is.value(error)) {
               reject(error);
            } else {
               resolve({
                  value: accessToken,
                  secret: accessTokenSecret,
                  expiration: null
               });
            }
         });
      });
   },

   /**
    * @returns {Promise.<Flickr.Tree>}
    */
   getCollections: () => call(method.COLLECTIONS, type.USER, config.flickr.userID, {
      value: r => r.collections.collection,
      allowCache: true
   }),

   /**
    * @param {String} id
    * @returns {Promise.<Flickr.SetInfo>}
    */
   getSetInfo: id => call(method.set.INFO, type.SET, id, { value: r => r.photoset, allowCache: true }),

   /**
    * @param {String} id
    * @returns {Promise.<Flickr.Size[]>}
    */
   getPhotoSizes: id => call(method.photo.SIZES, type.PHOTO, id, { value: r => r.sizes.size }),

   /**
    * @param {String} id
    * @returns {Promise.<Flickr.SetInfo[]>}
    */
   getPhotoContext: id => call(method.photo.SETS, type.PHOTO, id, { value: r => r.set }),

   /**
    * @param {String} id
    * @returns {Promise.<Flickr.EXIF>}
    */
   getExif: id => call(method.photo.EXIF, type.PHOTO, id, { value: r => r.photo.exif, allowCache: true }),

   /**
    * @param {String} id
    * @returns {Promise.<Flickr.PhotoSummary[]>}
    */
   getSetPhotos: id => call(method.set.PHOTOS, type.SET, id, {
      args: {
         extras: [extra.DESCRIPTION, extra.TAGS, extra.DATE_TAKEN, extra.LOCATION, extra.PATH_ALIAS]
            .concat(config.flickr.photoSize.post)
            .join()
      },
      value: r => r.photoset,
      allowCache: true
   }),

   /**
    * The documentation says signing is not required but results differ even with entirely
    * public photos -- perhaps a Flickr bug
    * @param {String[]|String} tags
    * @returns {Promise.<Flickr.PhotoSummary[]>}
    * @see https://www.flickr.com/services/api/flickr.photos.search.html
    */
   photoSearch: tags => call(method.photo.SEARCH, type.USER, config.flickr.userID, {
      args: {
         extras: config.flickr.photoSize.search.join(),
         tags: is.array(tags) ? tags.join() : tags,
         sort: 'relevance',
         per_page: 500         // maximum
      },
      value: r => r.photos.photo,
      signed: true
   }),

   /**
    * Photo tags for user
    * @returns {Promise.<Flickr.Tag[]>}
    */
   getAllPhotoTags: () => call(method.photo.TAGS, type.USER, config.flickr.userID, {
      value: r => r.who.tags.tag,
      sign: true,
      allowCache: true
   })
};