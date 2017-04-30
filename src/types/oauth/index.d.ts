/**
 * https://github.com/ciaranj/node-oauth
 */
declare module "oauth" {
   export class OAuth {
      constructor(
         requestUrl:string,
         accessUrl:string,
         consumerKey:string,
         consumerSecret:string,
         version:string,
         authorizeCallbackUrl:string,
         signatureMethod:string,
         nonceSize?:number,
         customheaders?:{[key:string]:string});

      get(url:string, token:string, tokenSecret:string, callback:(error:any, body:string)=>void):void;   
      get(url:string, token:string, tokenSecret:string, body:string, contentType:string, callback:(error:any, body:string)=>void):void;
      put(url:string, token:string, tokenSecret:string, body:string, contentType:string):string;
      post(url:string, token:string, tokenSecret:string, body:string, contentType:string):string;
      delete(url:string, token:string, tokenSecret:string, ):string;

      /**
       * Gets a request token from the OAuth provider and passes that information back
       * to the calling code.
       *
       * The callback should expect a function of the following form:
       *
       * function(err, token, token_secret, parsedQueryString) {}
       *
       * This method has optional parameters so can be called in the following 2 ways:
       *
       * 1) Primary use case: Does a basic request with no extra parameters
       *  getOAuthRequestToken( callbackFunction )
       *
       * 2) As above but allows for provision of extra parameters to be sent as part of the query to the server.
       *  getOAuthRequestToken( extraParams, callbackFunction )
       *
       * N.B. This method will HTTP POST verbs by default, if you wish to override this behaviour you will
       * need to provide a requestTokenHttpMethod option when creating the client.
       *
       **/
      getOAuthRequestToken(callback:(err:any, token:string, tokenSecret:string, parsedQueryString:string)=>void):void;
      getOAuthRequestToken(extraParams:string, callback:(err:any, token:string, tokenSecret:string, parsedQueryString:string)=>void):void;

      getOAuthAccessToken(token:string, tokenSecret:string, verifier:string, callback:(error:any, token:string, tokenSecret:string)=>void):void;

      signUrl(url:string, token:string, tokenSecret:string, method:string):string;

      authHeader(url:string, token:string, tokenSecret:string, method:string):string;
   }  
}