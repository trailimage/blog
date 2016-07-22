'use strict';

const config = require('./config');
const is = require('./is');
const log = require('./logger');
const format = require('./format');
const e = require('./enum');
const Google = require('googleapis');
const { ServerResponse } = require('http');
const request = require('request');
const removeHeaders = ['x-goog-hash','x-guploader-uploadid','expires','cache-control','alt-svc','via','server'];
// https://developers.google.com/drive/web/scopes
const scope = {
   drive: 'https://www.googleapis.com/auth/drive',
   driveReadOnly: 'https://www.googleapis.com/auth/drive.readonly',
   photoReadOnly: 'https://www.googleapis.com/auth/drive.photos.readonly'
};

const auth = new Google.auth.OAuth2(config.google.clientID, this._options.clientSecret, this._options.callback);
const drive = Google.drive({ version: 'v2', auth });

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
function verify(callback) {
   if (this._options.needsRefresh) {
      auth.refreshAccessToken((err, tokens) => {
         if (err === null) {
            log.infoIcon(icon.lock, 'Refreshed Google access token');

            auth.setCredentials(tokens);
            // also update options used to build download header
            this._options.accessToken = tokens.access_token;
            this._options.accessTokenExpiration = tokens.expiry_date;

            callback(true);
         } else {
            log.error('Refreshing Google access token failed because of %s', err.message);
            callback(false);
         }
      });
   } else {
      callback(true);
   }
}

// etrieve access and refresh tokens
function getAccessToken(code, callback) {
   auth.getToken(code, (err, tokens) => {
      if (err !== null) {
         log.error('Getting Google access token failed because of %s', err.message);
         callback(null, null, null);
      } else {
         auth.setCredentials(tokens);
         callback(tokens.access_token, tokens.refresh_token, new Date(tokens.expiry_date));
      }
   });
}

// https://developers.google.com/drive/v2/reference/files/get
// https://developers.google.com/drive/web/manage-downloads
// https://github.com/request/request
function downloadFile(url, post, callback) {
   verify(ready => {
      if (!ready) { return returnError(callback); }

      url = url + '?alt=media';

      let slug = post.isPartial ? post.seriesSlug : post.slug;
      let options = {
         url: url,
         headers: this.auth.requestHeader
      };

      if (!is.empty(config.proxy)) { options.proxy = config.proxy; }

      if (callback instanceof ServerResponse) {
         // pipe request directly to response
         request
            .get(url, options)
            .on('response', res => {
               res.headers['Content-Disposition'] = `attachment; filename="${format.slug(config.site.title)}_${slug}.gpx"`;
               removeHeaders.forEach(h => { delete res.headers[h]; });
            })
            .on('error', err => { handleError(post, callback, err); })
            .pipe(callback);
      } else {
         // load GPX as string
         request(options, (err, response, body) => {
            if (err === null) {
               if (body.length < 1000) {
                  try {
                     // assume body contains JSON error message
                     handleError(post, callback, JSON.parse(body));
                  } catch (ex) {
                     // otherwise log body
                     log.error('Invalid content for %s: %s', url, body);
                     callback(null);
                  }
               } else {
                  log.info('Completed GPX retrieval from %s (%d bytes)', url, body.length);
                  callback(body);
               }
            } else {
               log.error(err.toString());
               callback(null);
            }
         });
      }
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
   // https://developers.google.com/drive/v2/reference/children/list
   loadGPX(post, callback) {
      this.auth.verify(ready => {
         if (!ready) { return returnError(callback); }

         let options = {
            folderId: this.options.tracksFolder,
            //q: `title contains '${post.title}' and mimeType = 'text/xml'`
            q: `title = '${post.title}.gpx'`
         };

         this.drive.children.list(options, (err, list) => {
            if (err != null) {
               handleError(post, callback, err);
            } else if (list.items.length == 0) {
               // no matches
               log.info('No GPX file found for "%s"', post.title);
               returnError(callback);
            } else {
               let item = list.items[0];
               let purpose = 'Retrieving';
               let icon = icon.saveFile;

               if (callback instanceof ServerResponse) {
                  purpose = 'Downloading';
                  icon = icon.save;
               }
               log.infoIcon(icon, '%s GPX for "%s" (%s)', purpose, post.title, item.id);
               downloadFile(item.childLink, post, callback);
            }
         });
      });
   }
};