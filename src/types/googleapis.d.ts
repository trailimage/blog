/**
 * https://github.com/google/google-api-nodejs-client/issues/503
 */
declare module 'googleapis' {
   import * as Stream from 'stream';
   import { Request } from 'request';

   /**
    * https://developers.google.com/drive/v3/web/search-parameters
    */
   interface QueryOptions {
   }

   /**
    * https://developers.google.com/drive/v3/reference/files
    */
   interface File {
      id:string;
      kind:string;

      /**
       * The name of the file. This is not necessarily unique within a folder.
       * Note that for immutable items such as the top level folders of Team
       * Drives, My Drive root folder, and Application Data folder the name is
       * constant.
       */
      name:string;
      mimeType:string;
      description:string;
      starred:boolean;

      /**
       * A monotonically increasing version number for the file. This reflects
       * every change made to the file on the server, even those not visible
       * to the user.
       */
      version:number;
      createdTime:Date;
      modifiedTime:Date;
      shared:boolean;
      ownedByMe:boolean;

      /**
       * The original filename of the uploaded content if available, or else
       * the original value of the `name` field. This is only available for files
       * with binary content in Drive.
       */
      originalFileName:string;

      /**
       * The full file extension extracted from the `name` field. May contain
       * multiple concatenated extensions, such as "tar.gz". This is only
       * available for files with binary content in Drive.
       * 
       * This is automatically updated when the `name` field changes, however it
       * is not cleared if the new name does not contain a valid extension.
       */
      fullFileExtension:string;

      fileExtension:string;

      /**
       * The size of the file's content in bytes. This is only applicable to
       * files with binary content in Drive.
       */
      size:number;
   }

   /**
    * https://developers.google.com/drive/v3/reference/files/list
    */
   interface FileList {
      files:File[];
   }

   interface FileQuery {
      list(options:QueryOptions, callback:(err:Error, list:FileList)=>void):void;
      /**
       * https://developers.google.com/drive/v3/reference/files/get
       * 
       * Getter uses https://github.com/request/request
       */
      get(options:QueryOptions, callback?:(err:Error, body:string, response:any)=>void):Request;
   }

   export interface Drive {
      files:FileQuery;
   }

   export function drive(apiVersion:string):Drive;
}

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