'use strict';

const config = require('./config');
const C = require('./constants');
const is = require('./is');
const log = require('./logger');
const format = require('./format');
const googleAPIs = require('googleapis');

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

// set expiration a minute earlier than actual so refresh occurs before Google blocks request
const minuteEarlier = ms => {
   let d = new Date(ms);
   d.setMinutes(d.getMinutes() - 1);
   return d;
};

/**
 * Refresh access token and proceed
 * @see https://developers.google.com/drive/v3/web/quickstart/nodejs
 * @returns {Promise}
 */
const verifyToken = ()=> new Promise((resolve, reject) => {
   authClient.setCredentials({
      access_token: authConfig.token.access,
      refresh_token: authConfig.token.refresh
   });
   if (accessTokenExpired()) {
      authClient.refreshAccessToken((err, tokens) => {
         if (is.value(err)) {
            log.error('Unable to refresh Google access token: %s', err.message);
            reject(err);
         } else {
            log.infoIcon(C.icon.lock, 'Refreshed Google access token');

            authClient.setCredentials(tokens);
            // TODO also update options used to build download header
            authConfig.token.type = tokens.token_type;
            authConfig.token.access = tokens.access_token;
            authConfig.token.accessExpiration = minuteEarlier(tokens.expiry_date);

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

//endregion
//region Drive

const driveConfig = config.google.drive;
let _drive = null;

function drive() {
   if (_drive === null) { _drive = googleAPIs.drive('v3'); }
   return _drive;
}

/**
 * @param {Post} post
 * @param {BlogResponse} [res] Include response to stream file directly to client
 * @returns {Promise}
 * @see https://developers.google.com/drive/v3/reference/files/list
 * @see https://developers.google.com/drive/v3/web/search-parameters
 */
const loadGPX = (post, res) => verifyToken().then(() => new Promise((resolve, reject) => {
   const options = {
      auth: authClient,
      q: `name = '${post.title}.gpx' and '${driveConfig.tracksFolder}' in parents`
   };

   drive().files.list(options, (err, list) => {
      if (err !== null) {
         log.error('Error finding GPX for “%s”: %s', post.title, err.message);
         reject(err);
      } else if (!is.array(list.files) || list.files.length == 0) {
         // no matches
         reject(`No GPX file found for “${post.title}”`);
      } else {
         const file = list.files[0];
         let purpose = 'Retrieving';
         let icon = C.icon.saveFile;

         if (is.value(res)) {
            purpose = 'Downloading';
            icon = C.icon.download;
         }
         log.infoIcon(icon, '%s GPX for “%s” (%s)', purpose, post.title, file.id);
         resolve(downloadFile(file.id, post, res));
      }
   });
}));

/**
 *
 * @param {String} fileId
 * @param {Post} post
 * @param {BlogResponse} [res]
 * @returns {Promise}
 * @see https://developers.google.com/drive/v3/reference/files/get
 * @see https://developers.google.com/drive/v3/web/manage-downloads
 * @see https://github.com/bitinn/node-fetch
 */
const downloadFile = (fileId, post, res) => verifyToken().then(()=> {
   //const key = post.isPartial ? post.seriesKey : post.key;
   const { Writable } = require('stream');
   const util = require('util');
   //const fs = require('fs');
   //const dest = fs.createWriteStream(__dirname + '/' + fileId + '.gpx');
   const options = {
      fileId,
      auth: authClient,
      alt: 'media'
   };

   let content = new Buffer('');

   /* Writable memory stream */
   function memoryStream(options) {
      // allow use without new operator
      if (!(this instanceof memoryStream)) {
         return new memoryStream(options);
      }
      Writable.call(this, options);
   }
   util.inherits(memoryStream, Writable);

   memoryStream.prototype._write = function (chunk, enc, cb) {
      var buffer = (Buffer.isBuffer(chunk)) ? chunk : Buffer.from(chunk, enc);
      content = Buffer.concat([content, buffer]);
      cb();
   };

   let ms = new memoryStream();

   return new Promise((resolve, reject) => {
      //res.onEnd = resolve;
      ms.on('finish', ()=> { resolve(content.toString('utf8')); });

      drive().files
         .get(options)
         .on('end', ()=> {
            let x = 'something';
         })
         .on('error', reject)
         .pipe(ms);
   });
});

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
      loadGPX
   }
};