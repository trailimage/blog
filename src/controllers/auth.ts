import { Response, Request } from 'express';
import { is, HttpStatus } from '@toba/tools';
import { log } from '@toba/logger';
import { config } from '../config';
import { Page } from '../views/';
// import flickr from '../providers/flickr';
// import google from '../providers/google';

/**
 * Redirect to authorization URL for unauthorized providers
 *
 * https://github.com/google/google-api-nodejs-client/#generating-an-authentication-url
 */
export function view(_req: Request, res: Response) {
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
 * Retrieve tokens for Flickr and display on page to be manually copied into
 * configuration
 *
 * http://www.flickr.com/services/api/auth.oauth.html
 */
export function flickrAuth(req: Request, res: Response) {
   if (is.empty(req.param('oauth_token'))) {
      log.warn('%s is updating Flickr tokens', req.clientIP());
      flickr.auth.getRequestToken().then(url => res.redirect(url));
   } else {
      const token = req.param('oauth_token');
      const verifier = req.param('oauth_verifier');

      flickr.auth
         .getAccessToken(token, verifier)
         .then(token => {
            res.render(template.page.AUTHORIZE, {
               title: 'Flickr Access',
               token: token.access,
               secret: token.secret,
               layout: template.layout.NONE
            });
         })
         .catch((err: Error) => {
            log.error(err);
         });
   }
}

/**
 * Retrieve tokens for Google and display on page to be manually copied into
 * configuration
 *
 * https://github.com/google/google-api-nodejs-client/
 */
export function googleAuth(req: Request, res: Response) {
   const code = req.param('code');

   if (is.empty(code)) {
      res.end('Cannot continue without Google authorization code');
   } else {
      google.auth
         .getAccessToken(code)
         .then(token => {
            res.render(Page.Authorize, {
               title: 'Google Access',
               token: token.access,
               secret: token.refresh,
               layout: template.layout.NONE
            });
         })
         .catch(err => {
            log.error(err);
            res.status(HttpStatus.InternalError);
            res.end(err.toString());
         });
   }
}

export const auth = { google: googleAuth, flickr: flickrAuth, view };
