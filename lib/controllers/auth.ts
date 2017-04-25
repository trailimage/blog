import { Blog } from '../types';
import is from '../is';
import log from '../logger';
import config from '../config';
import template from '../template';
import flickr from '../providers/flickr';
import google from '../providers/google';
import C from '../constants';

/**
 * See https://github.com/google/google-api-nodejs-client/#generating-an-authentication-url
 */
function view(req:Blog.Request, res:Blog.Response) {
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
 * 
 * See http://www.flickr.com/services/api/auth.oauth.html
 */
function f(req:Blog.Request, res:Blog.Response) {
   if (is.empty(req.param('oauth_token'))) {
      log.warn('%s is updating Flickr tokens', req.clientIP());
      flickr.getRequestToken().then(url => res.redirect(url));
   } else {
      const token = req.param('oauth_token');
      const verifier = req.param('oauth_verifier');

      flickr.getAccessToken(token, verifier)
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
function g(req:Blog.Request, res:Blog.Response) {
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

export default { flickr: f, google: g, view };