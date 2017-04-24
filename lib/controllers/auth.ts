const is = require('../is');
const log = require('../logger');
const config = require('../config');
const template = require('../template');
const C = require('../constants');

/**
 * @see https://github.com/google/google-api-nodejs-client/#generating-an-authentication-url
 */
function view(req, res) {
   const flickr = require('./flickr');
   const google = require('./google');

   if (config.needsAuth) {
      if (flickr.auth.isEmpty()) {
         res.redirect(flickr.auth.url());
      } else if (google.auth.isEmpty()) {
         res.redirect(google.auth.url());
      }
   } else {
      // we shouldn't be here
   }
}

/**
 * Default route action
 * @see http://www.flickr.com/services/api/auth.oauth.html
 */
function flickr(req, res) {
   const f = require('./flickr');

   if (is.empty(req.param('oauth_token'))) {
      log.warn('%s is updating Flickr tokens', req.clientIP());
      f.getRequestToken().then(url => res.redirect(url));
   } else {
      const token = req.param('oauth_token');
      const verifier = req.param('oauth_verifier');

      f.getAccessToken(token, verifier)
         .then(token => {
            res.render(template.page.AUTHORIZE, {
               title: 'Flickr Access',
               token: token.value,
               secret: token.secret,
               layout: template.layout.NONE
            });
         })
         .catch(err => {

         });
   }
}

/**
 * @see https://github.com/google/google-api-nodejs-client/
 */
function google(req, res) {
   const google = require('./google');
   const code = req.param('code');

   if (is.empty(code)) {
      res.end('Cannot continue without Google authorization code');
   } else {
      google.auth.getAccessToken(code)
         .then(token => {
            res.render(template.page.AUTHORIZE, {
               title: 'Google Access',
               token: token.access,
               secret: token.refresh,
               layout: template.layout.NONE
            });
         })
         .catch(err => {
            log.error(err);
            res.status(C.httpStatus.INTERNAL_ERROR);
            res.end(err.toString());
         });
   }
}

module.exports = { flickr, google, view };