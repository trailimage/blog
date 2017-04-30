declare class GoogleAuthLibrary {
   constructor();
   OAuth2: OAuth2Constructor;
}

interface UrlOptions {
   access_type:string;
   approval_prompt:string;
   scope:string;
}

/** Method to transform rendered text before it's cached and sent */
type Callback = (err:Error, tokens:Tokens) => void;

interface Tokens {
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

interface OAuth2Constructor {
   new(clientID:string, secret:string, callbackURL:string):OAuth2;
}

declare module GoogleAuthLibrary {}

/**
 * https://github.com/google/google-auth-library-nodejs
 */
declare module 'google-auth-library' {
   export = GoogleAuthLibrary;
}