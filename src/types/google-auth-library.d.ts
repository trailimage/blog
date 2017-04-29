declare module 'google-auth-library' {
   interface UrlOptions {
      access_type:string;
      approval_prompt:string;
      scope:string;
   }

   /** Method to transform rendered text before it's cached and sent */
   export type Callback = (err:Error, tokens:Tokens) => void;

   export interface Tokens {
      access_token:string;
      refresh_token:string;
      token_type?:string;
      expiry_date?:number;
   }

   interface OAuth2 {
      credentials:Tokens;
      generateAuthUrl(options:UrlOptions):string;
      setCredentials(tokens:Tokens):void;
      refreshAccessToken(callback:Callback):void;
      getToken(code:string, callback:Callback):void;
   }

   interface OAuthConstructor {
      new(clientID:string, secret:string, callbackURL:string):OAuth2;
   }

   export default class {
      OAuth2:OAuthConstructor
   }
}