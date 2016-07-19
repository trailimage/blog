'use strict';

let accessTokenExpiration = null;

// https://www.flickr.com/services/api/auth.oauth.html
module.exports = {
   _version: 2,
   encryption: 'HMAC-SHA1',
   // may also be called the consumer key, client key or user ID
   clientID: null,
   clientSecret: null,

   get consumerKey() { return this.clientID; },
   get version() { return this._version == 1 ? '1.0A' : '2.0';	},

   // region 1.0A

   // call service with client ID to retrieve request token and token secret which will subsequently be exchanged for an access token
   tokenSecret: null,
   requestToken: null,
   // returned from service after client authorizes request token
   verifier: null,

   // endregion

   accessToken: null,

   // 2.0A
   refreshToken: null,

   // set expiration a minute earlier than actual so refresh occurs before provider blocks request
   // e.g. 1449335813845
   set accessTokenExpiration(ms) {
      let d = new Date(ms);
      d.setMinutes(d.getMinutes() - 1);
      accessTokenExpiration = d;
   },

   // OAuth 2.0 can generate a new access token from a refresh token
   get needsAuth() {
      return ((this._version == 1 && this.accessToken === null) || this.refreshToken === null);
   },

   // whether OAuth 2.0 access token needs to be refreshed
   get needsRefresh() {
      return (this.refreshToken !== null && (accessTokenExpiration === null || accessTokenExpiration < new Date()));
   }

// if (tokenRefreshOrSecret !== undefined) {
//    if (this._version == 1) {
//       this.tokenSecret = tokenRefreshOrSecret;
//    } else {
//       this.refreshToken = tokenRefreshOrSecret;
//    }
// }
};