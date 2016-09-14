'use strict';

const config = require('./config');
const C = require('./constants');
const is = require('./is');
const log = require('./logger');
const format = require('./format');
const googleAPIs = require('googleapis');
const request = require('node-fetch');
const removeHeaders = ['x-goog-hash','x-guploader-uploadid','expires','cache-control','alt-svc','via','server'];

//region Authentication

const googleAuth = require('google-auth-library');
// https://developers.google.com/drive/web/scopes
const scope = {
   drive: {
      READ_WRITE: 'https://www.googleapis.com/auth/drive',
      READ_ONLY: 'https://www.googleapis.com/auth/drive.readonly',
   },
   photo: {
      READ_ONLY: 'https://www.googleapis.com/auth/drive.photos.readonly'
   }
};
const auth = new googleAuth();
const authConfig = config.google.auth;
const authClient = new auth.OAuth2(authConfig.clientID, authConfig.secret, authConfig.callback);

const authorizationURL = ()=> authClient.generateAuthUrl({
   access_type: 'offline',    // gets refresh token
   approval_prompt: 'force',  // gets refresh token every time
   scope: scope.drive.READ_ONLY
});

/**
 * Whether access token needs to be refreshed
 * @returns {Boolean} True if a refresh token is available and expiration is empty or old
 */
const accessTokenExpired = ()=> is.value(authConfig.token.refresh) &&
   (authConfig.token.accessExpiration === null || authConfig.token.accessExpiration < new Date());

/**
 * Refresh access token and proceed
 * @see https://developers.google.com/drive/v3/web/quickstart/nodejs
 * @returns {Promise}
 */
const verifyToken = ()=> new Promise((resolve, reject) => {
   if (accessTokenExpired()) {
      authClient.refreshAccessToken((err, tokens) => {
         if (is.value(err)) {
            reject(err);
         } else {
            log.infoIcon(C.icon.lock, 'Refreshed Google access token');

            authClient.setCredentials(tokens);
            // TODO also update options used to build download header
            authConfig.token.access = tokens.access_token;
            authConfig.token.accessExpiration = tokens.expiry_date;

            resolve();
         }
      });
   } else {
      resolve();
   }
});

/**
 * Retrieve access and refresh tokens
 * @param {String} code
 * @returns {Promise.<Object>}
 */
const getAccessToken = code => new Promise((resolve, reject) => {
   // set expiration a minute earlier than actual so refresh occurs before Google blocks request
   const minuteEarlier = ms => {
      let d = new Date(ms);
      d.setMinutes(d.getMinutes() - 1);
      return d;
   };
   authClient.getToken(code, (err, token) => {
      if (is.value(err)) {
         reject(err);
      } else {
         authClient.credentials = token;
         resolve({
            access: token.access_token,
            refresh: token.refresh_token,
            accessExpiration: minuteEarlier(token.expiry_date)
         });
      }
   });
});

// const tokenFromConfig = () => ({
//    access_token: authConfig.token.access,
//    refresh_token: authConfig.token.refresh
// });
//
// const tokenToConfig = token => {
//    authConfig.access = token.access_token;
//    authConfig.refresh = token.refresh_token;
//    authConfig.accessExpiration = new Date(token.expiry_date);
// };

//endregion
//region Drive

const drive = googleAPIs.drive({ version: 'v3', auth: authClient });

/**
 *
 * @param {String} url
 * @param {Post} post
 * @param {ServerResponse} [res]
 * @returns {Promise}
 * @see https://developers.google.com/drive/v2/reference/files/get
 * @see https://developers.google.com/drive/web/manage-downloads
 * @see https://github.com/request/request
 */
const downloadFile = (url, post, res) => verifyToken().then(()=> {
   url = url + '?alt=media';

   let key = post.isPartial ? post.seriesKey : post.key;
   let options = {
      url: url,
      headers: oauth.auth.requestHeader
   };

   return new Promise((resolve, reject) => {
      if (res !== undefined) {
         // pipe request directly to response
         request
            .get(url, options)
            .on('response', fileResponse => {
               fileResponse.headers['Content-Disposition'] = `attachment; filename="${format.slug(config.site.title)}_${key}.gpx"`;
               removeHeaders.forEach(h => { delete fileResponse.headers[h]; });
               resolve();
            })
            .on('error', reject)
            .pipe(res);
      } else {
         // load GPX as string
         request(options, (err, response, body) => {
            if (err === null) {
               if (body.length < 1000) {
                  try {
                     // assume body contains JSON error message
                     reject(JSON.parse(body));
                     // assume body contains JSON error message
                     handleError(post, callback, JSON.parse(body));
                  } catch (ex) {
                     // otherwise log body
                     reject('Invalid content for %s: %s', url, body);
                  }
               } else {
                  log.info('Completed GPX retrieval from %s (%d bytes)', url, body.length);
                  resolve(body);
               }
            } else {
               reject(err.toString());
            }
         });
      }
   });
});

function requestHeader() {
   return {
      'User-Agent': 'node.js',
      'Authorization': 'Bearer ' + this._options.accessToken
   }
}

function handleError(post, callback, err) {
   log.error('Loading GPX file for "%s" failed because of %s', post.title, JSON.stringify(err));
   returnError(callback);
}

// return error through callback or HTTP response
function returnError(callback) {
   if (callback instanceof ServerResponse) {
      callback.notFound();
   } else {
      callback(null);
   }
}

//endregion
//region YouTube

//endregion

module.exports = {
   auth: {
      url: authorizationURL,
      client: authClient,
      verify: verifyToken,
      expired: accessTokenExpired
   },
   drive: {
      /**
       * @param {Post} post
       * @param {BlogResponse} [res]
       * @returns {Promise}
       * @see https://developers.google.com/drive/v2/reference/children/list
       */
      loadGPX: (post, res) => verifyToken().then(() => new Promise((resolve, reject) => {
         let options = {
            folderId: this.options.tracksFolder,
            //q: `title contains '${post.title}' and mimeType = 'text/xml'`
            q: `title = '${post.title}.gpx'`
         };

         this.drive.children.list(options, (err, list) => {
            if (err != null) {
               reject(err);
            } else if (list.items.length == 0) {
               // no matches
               reject('No GPX file found for "%s"', post.title);
            } else {
               let item = list.items[0];
               let purpose = 'Retrieving';
               let icon = C.icon.saveFile;

               if (res !== undefined) {
                  purpose = 'Downloading';
                  icon = icon.save;
               }
               log.infoIcon(icon, '%s GPX for "%s" (%s)', purpose, post.title, item.id);
               downloadFile(item.childLink, post, res);
            }
         });
      }))
   }
};