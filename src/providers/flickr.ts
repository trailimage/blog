import { Flickr, Provider } from '../types';
import config from '../config';
import log from '../logger';
import is from '../is';
import util from '../util';
import cache from '../cache/api';
import fetch from 'node-fetch';
import { OAuth } from 'oauth';
import { globalAgent} from 'https';

globalAgent.maxSockets = 200;

const type = { USER: 'user_id', SET: 'photoset_id', PHOTO: 'photo_id' };
const url = {
   BASE: '/services/rest/',
   REQUEST_TOKEN: 'http://www.flickr.com/services/oauth/request_token',
   AUTHORIZE: 'http://www.flickr.com/services/oauth/authorize',
   ACCESS_TOKEN: 'http://www.flickr.com/services/oauth/access_token',
   PHOTO_SET: 'http://www.flickr.com/photos/trailimage/sets/'
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
/**
 * Number of retries keyed to API method.
 */
const retries:{[key:string]:number} = {};
const host = 'api.flickr.com';
const oauth = new OAuth(
   url.REQUEST_TOKEN,
   url.ACCESS_TOKEN,
   config.flickr.auth.apiKey,
   config.flickr.auth.secret,
   '1.0A',
   config.flickr.auth.callback,
   'HMAC-SHA1');

const defaultCallOptions:Flickr.Options<Flickr.Response> = {
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

/**
 * Load response from cache or call API
 */
function call<T>(
   method:string,
   idType:string,
   id:string,
   options:Flickr.Options<T>):Promise<T> {

   options = Object.assign({}, defaultCallOptions, options);
   // generate fallback API call
   const noCache = ()=> callAPI<T>(method, idType, id, options);

   return (config.cache.json && options.allowCache)
      ? cache.getItem<T>(method, id)
         .then(item => is.value(item) ? item : noCache())
         .catch((err:Error) => {
            log.error('Error getting Flickr %s:%s from cache: %j', method, id, err);
            return noCache();
         })
      : noCache();
}

/**
 * Invoke remote API when method result isn't cached locally.
 *
 * See http://www.flickr.com/services/api/response.json.html
 */
function callAPI<T>(
   method:string,
   idType:string,
   id:string,
   options:Flickr.Options<T>):Promise<T> {

   // create key to track retries and log messages
   const key = method + ':' + id;
   const methodUrl = 'https://' + host + url.BASE + parameterize(method, idType, id, options.args);

   return new Promise<T>((resolve, reject) => {
      const token = config.flickr.auth.token;
      // response handler that may retry call
      const handler = (err:any, body:string, attempt:Function) => {
         let tryAgain = false;
         if (err === null) {
            const res = parse(body, key);
            if (res.stat == 'ok') {
               clearRetries(key);
               const parsed = options.value(res);
               resolve(parsed);
               // cache result
               if (config.cache.json && options.allowCache) { cache.add(method, id, parsed); }
            } else {
               tryAgain = res.retry;
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
 */
function parse(body:string, key:string):Flickr.Response {
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
 */
function retry(fn:Function, key:string):boolean {
   let count = 1;

   if (retries[key]) { count = ++retries[key]; } else { retries[key] = count; }

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
 * Clear retry count and log success.
 */
function clearRetries(key:string) {
   if (retries[key] && retries[key] > 0) {
      log.info('Call to %s succeeded', key);
      retries[key] = 0;
   }
}

/**
 * Setup standard parameters.
 */
function parameterize(
   method:string,
   idType?:string,
   id?:string,
   args:{[key:string]:string|number|boolean} = {}):string {

   let qs = '';
   let op = '?';

   args.api_key = config.flickr.auth.apiKey;
   args.format = 'json';
   args.nojsoncallback = 1;
   args.method = 'flickr.' + method;

   if (is.value(idType) && is.value(id)) { args[idType] = id; }
   for (const k in args) { qs += op + k + '=' + encodeURIComponent(args[k].toString()); op = '&'; }
   return qs;
}

export default {
   /**
    * Return cache keys to support invalidation
    */
   cache: {
      keysForPost: [method.set.INFO, method.set.PHOTOS],
      keysForPhoto: [method.photo.SIZES],
      keysForLibrary: [method.COLLECTIONS, method.photo.TAGS]
   },

   auth: {
      isEmpty() { return is.empty(config.flickr.auth.token.access); },
      url() { return config.flickr.auth.callback; }
   },

   getRequestToken():Promise<string> {
      const token = config.flickr.auth.token;
      return new Promise<string>((resolve, reject) => {
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

   getAccessToken(requestToken:string, verifier:string):Promise<any> {
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

   getCollections: ()=> call<Flickr.Collection[]>(method.COLLECTIONS, type.USER, config.flickr.userID, {
      value: r => r.collections.collection,
      allowCache: true
   }),


   getSetInfo: (id:string) => call<Flickr.SetInfo>(method.set.INFO, type.SET, id, {
      value: r => r.photoset as Flickr.SetInfo,
      allowCache: true
   }),

   getPhotoSizes: (id:string) => call<Flickr.Size[]>(method.photo.SIZES, type.PHOTO, id, {
      value: r => r.sizes.size
   }),

   getPhotoContext: (id:string) => call<Flickr.MemberSet[]>(method.photo.SETS, type.PHOTO, id, {
      value: r => r.set
   }),

   getExif: (id:number) => call<Flickr.PhotoExif>(method.photo.EXIF, type.PHOTO, id.toString(), {
      value: r => r.photo.exif,
      allowCache: true
   }),

   getSetPhotos: (id:string) => call<Flickr.SetPhotos>(method.set.PHOTOS, type.SET, id, {
      args: {
         extras: [extra.DESCRIPTION, extra.TAGS, extra.DATE_TAKEN, extra.LOCATION, extra.PATH_ALIAS]
            .concat(config.flickr.photoSize.post)
            .join()
      },
      value: r => r.photoset as Flickr.SetPhotos,
      allowCache: true
   }),

   /**
    * The documentation says signing is not required but results differ even with entirely
    * public photos -- perhaps a Flickr bug
    *
    * See https://www.flickr.com/services/api/flickr.photos.search.html
    */
   photoSearch: (tags:string|string[]) => call<Flickr.PhotoSummary[]>(method.photo.SEARCH, type.USER, config.flickr.userID, {
      args: {
         extras: config.flickr.photoSize.search.join(),
         tags: is.array(tags) ? tags.join() : tags,
         sort: 'relevance',
         per_page: 500         // maximum
      },
      value: r => r.photos.photo as Flickr.PhotoSummary[],
      sign: true
   }),

   /**
    * Photo tags for user
    */
   getAllPhotoTags: () => call<Flickr.Tag[]>(method.photo.TAGS, type.USER, config.flickr.userID, {
      value: r => r.who.tags.tag,
      sign: true,
      allowCache: true
   })
} as Provider.Flickr;