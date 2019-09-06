import fetch from 'node-fetch';

/**
 * Mock the OAuth client imported by @toba/oauth
 */
export class OAuth {
   urls: { [key: string]: string };
   last: {
      accessToken: string;
      secret: string;
   };

   constructor(
      requestTokenUrl: string,
      accessTokenUrl: string,
      apiKey: string,
      secret: string,
      version: string,
      callbackUrl: string,
      hashing: string
   ) {
      this.urls = {
         requestTokenUrl,
         accessTokenUrl,
         callbackUrl
      };
      this.last = {
         accessToken: '',
         secret: ''
      };
   }

   /**
    * Get URL as basic fetch and record the token information.
    */
   get(
      url: string,
      accessToken: string,
      secret: string,
      callback: (err: any, body: string) => void
   ) {
      this.last.accessToken = accessToken;
      this.last.secret = secret;

      fetch(url)
         .then(res => res.text())
         .then(body => {
            callback(null, body);
         })
         .catch(err => {
            callback(err, '');
         });
   }
}
