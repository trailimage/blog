'use strict';

const config = require('./config');
const e = require('./constants');
const is = require('./is');
const log = require('./logger');
const format = require('./format');
const Google = require('googleapis');
const { ServerResponse } = require('http');
const request = require('request');
let needsRefresh = false;
const removeHeaders = ['x-goog-hash','x-guploader-uploadid','expires','cache-control','alt-svc','via','server'];
// https://developers.google.com/drive/web/scopes
const scope = {
   drive: 'https://www.googleapis.com/auth/drive',
   driveReadOnly: 'https://www.googleapis.com/auth/drive.readonly',
   photoReadOnly: 'https://www.googleapis.com/auth/drive.photos.readonly'
};

const authConfig = config.google.auth;
const oauth = new Google.auth.OAuth2(config.google.auth.clientID, config.google.auth.secret, config.google.auth.callback);
const drive = Google.drive({ version: 'v2', auth: oauth });

function authorizationURL() {
   return auth.generateAuthUrl({
      access_type: 'offline',    // gets refresh token
      approval_prompt: 'force',  // gets refresh token every time
      scope: scope.driveReadOnly
   });
}

function requestHeader() {
   return {
      'User-Agent': 'node.js',
      'Authorization': 'Bearer ' + this._options.accessToken
   }
}

// refresh access token as needed
// https://github.com/google/google-api-nodejs-client/#manually-refreshing-access-token
/**
 * Refresh access token and proceed
 * @returns {Promise}
 */
function freshenUp() {
   return new Promise((resolve, reject) => {
      if (needsRefresh) {
         oauth.refreshAccessToken((err, tokens) => {
            if (is.value(err)) {
               reject(err);
            } else {
               log.infoIcon(e.icon.lock, 'Refreshed Google access token');

               oauth.setCredentials(tokens);
               // also update options used to build download header
               authConfig.token.access = tokens.access_token;
               authConfig.token.accessExpiration = tokens.expiry_date;

               resolve();
            }
         });
      } else {
         resolve();
      }
   })
}

/**
 * Retrieve access and refresh tokens
 * @param {String} code
 * @returns {Promise}
 */
function getAccessToken(code) {
   return new Promise((resolve, reject) => {
      oauth.getToken(code, (err, tokens) => {
         if (is.value(err)) {
            reject(err);
         } else {
            auth.setCredentials(tokens);
            resolve({
               access: tokens.access_token,
               refresh: tokens.refresh_token,
               expiration: new Date(tokens.expiry_date)

            });
         }
      });
   });
}

// https://developers.google.com/drive/v2/reference/files/get
// https://developers.google.com/drive/web/manage-downloads
// https://github.com/request/request
/**
 *
 * @param {String} url
 * @param {Post} post
 * @param {ServerResponse} [res]
 * @returns {Promise}
 */
function downloadFile(url, post, res) {
   return freshenUp()
      .then(()=> {
         url = url + '?alt=media';

         let slug = post.isPartial ? post.seriesSlug : post.slug;
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
                     fileResponse.headers['Content-Disposition'] = `attachment; filename="${format.slug(config.site.title)}_${slug}.gpx"`;
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

module.exports = {
   /**
    * @param {Post} post
    * @param {ServerResponse} [res]
    * @returns {Promise}
    * @see https://developers.google.com/drive/v2/reference/children/list
    */
   loadGPX(post, res) {
      return freshenUp().then(() => new Promise((resolve, reject) => {
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
               let icon = e.icon.saveFile;

               if (res !== undefined) {
                  purpose = 'Downloading';
                  icon = icon.save;
               }
               log.infoIcon(icon, '%s GPX for "%s" (%s)', purpose, post.title, item.id);
               downloadFile(item.childLink, post, res);
            }
         });
      });
   }
};