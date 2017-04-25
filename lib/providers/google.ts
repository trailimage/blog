import { Post } from '../types';
import config from '../config';
import C from '../constants';
import is from '../is';
import log from '../logger';
import googleAPIs from 'googleapis';
import googleAuth from 'google-auth-library';

// https://developers.google.com/drive/web/scopes
const scope = {
   drive: {
      READ_WRITE: 'https://www.googleapis.com/auth/drive',
      READ_ONLY: 'https://www.googleapis.com/auth/drive.readonly'
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
 * @returns {boolean} True if a refresh token is available and expiration is empty or old
 */
const accessTokenExpired = ()=> is.value(authConfig.token.refresh) &&
   (authConfig.token.accessExpiration === null || authConfig.token.accessExpiration < new Date());

/**
 * Set expiration a minute earlier than actual so refresh occurs before Google
 * blocks request.
 */
const minuteEarlier = (ms:number) => {
   const d = new Date(ms);
   d.setMinutes(d.getMinutes() - 1);
   return d;
};

/**
 * Refresh access token and proceed
 * 
 * See https://developers.google.com/drive/v3/web/quickstart/nodejs
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
            log.infoIcon('lock_outline', 'Refreshed Google access token');

            authClient.setCredentials(tokens);

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
 */
const getAccessToken = (code:string) => new Promise((resolve, reject) => {
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

const driveConfig = config.google.drive;
let _drive = null;

function drive() {
   if (_drive === null) { _drive = googleAPIs.drive('v3'); }
   return _drive;
}

/**
 * See https://developers.google.com/drive/v3/reference/files/list
 * See https://developers.google.com/drive/v3/web/search-parameters
 */
const loadGPX = (post:Post, stream:Stream.Writable) => verifyToken().then(() => new Promise((resolve, reject) => {
   const options = {
      auth: authClient,
      q: `name = '${post.title}.gpx' and '${driveConfig.tracksFolder}' in parents`
   };

   drive().files.list(options, (err, list) => {
      // set flag so we don't try repeatedly
      post.triedTrack = true;

      if (err !== null) {
         log.error('Error finding GPX for “%s”: %s', post.title, err.message);
         reject(err);
      } else if (!is.array(list.files) || list.files.length == 0) {
         // no matches
         post.hasTrack = false;
         log.warn(`No GPX file found for “${post.title}”`);
         reject();
      } else {
         const file = list.files[0];
         let purpose = 'Retrieving';
         let icon = 'save';

         if (is.value(stream)) {
            purpose = 'Downloading';
            icon = 'file_download';
         }
         log.infoIcon(icon, '%s GPX for “%s” (%s)', purpose, post.title, file.id);
         resolve(downloadFile(file.id, post, stream));
      }
   });
}));

/**
 * Google downloader uses Request module
 * 
 * See https://developers.google.com/drive/v3/reference/files/get
 * See https://developers.google.com/drive/v3/web/manage-downloads
 * 
 * Getter uses request library
 * 
 * See https://github.com/request/request
 */
const downloadFile = (fileId:string, post:Post, stream:Stream.Writable|Event.EventEmitter) => verifyToken().then(()=> new Promise((resolve, reject) => {
   const options = { fileId, auth: authClient, alt: 'media', timeout: 10000 };
   if (is.value(stream)) {
      // pipe to stream
      stream.on('finish', resolve);
      drive().files
         .get(options)
         .on('error', reject)
         .on('end', ()=> { post.hasTrack = true; })
         .on('response', res => {
            // response headers are piped directly to the stream so changes must happen here
            res.headers[C.header.content.DISPOSITION.toLowerCase()] = `attachment; filename=${post.key}.gpx`;
            res.headers[C.header.content.TYPE.toLowerCase()] = C.mimeType.GPX;
         })
         .pipe(stream);
   } else {
      // capture file contents
      drive().files
         .get(options, (err, body, response) => {
            if (is.value(err)) {
               reject(err);
            } else {
               post.hasTrack = true;
               resolve(body);
            }
         })
         .on('error', reject);
   }
}));

export default {
   auth: {
      url: authorizationURL,
      client: authClient,
      verify: verifyToken,
      expired: accessTokenExpired,
      getAccessToken,
      isEmpty() { return is.empty(authConfig.token.access); }
   },
   drive: {
      loadGPX
   }
};