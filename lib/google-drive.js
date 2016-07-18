'use strict';

const config = require('./config');
const is = require('./is');
const log = require('./logger');
const format = require('./format');
const { icon } = require('./enum');
const GoogleDrive = require('googleapis').drive;
const GoogleAuth = TI.Auth.Google;
const { ServerResponse } = require('http');
const request = require('request');
const removeHeaders = ['x-goog-hash','x-guploader-uploadid','expires','cache-control','alt-svc','via','server'];

this.auth = new GoogleAuth(GoogleAuth.Scope.drive, this.options.auth);
const drive = GoogleDrive({ version: 'v2', auth: this.auth.client });

// https://developers.google.com/drive/v2/reference/files/get
// https://developers.google.com/drive/web/manage-downloads
// https://github.com/request/request
function downloadFile(url, post, callback) {
   this.auth.verify(ready => {
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
               res.headers['Content-Disposition'] = `attachment; filename="${format.slug(config.title)}_${slug}.gpx"`;
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

function getAccessToken(code, callback) { this.auth.getAccessToken(code, callback); }
function get authorizationURL() { return this.auth.authorizationURL; }
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

/**
 * Retrieve Google drive files related to post
 * @extends TI.Provider.File.Base
 * @extends TI.Auth.Base
 * @alias TI.Provider.File.Google
 * @see https://developers.google.com/drive/v2/reference/
 * @see https://developers.google.com/drive/v2/reference/files/get#examples
 * @see https://github.com/google/google-api-nodejs-client/
 * @see https://developers.google.com/apis-explorer/#p/
 */
class GoogleFile extends FileBase {
	/**
	 * @param {Object} options
	 */
	constructor(options) {
		super();
		/** @type defaultGoogleOptions */
		this.options = extend(true, defaultGoogleOptions, options);

		// auth options are in the auth helper
		delete this.options.auth;
	}

	/**
	 * @returns {Boolean}
	 */
	get needsAuth() { return this.auth.needed; }

	/**
	 * @param {Boolean} needs
	 */
	set needsAuth(needs) { this.auth.needed = needs; }


}