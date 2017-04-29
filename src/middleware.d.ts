import {Flickr, Cache} from './types';
import {EventEmitter} from "events";
import {
   Response as ExpressResponse,
   Request as ExpressRequest } from "express";

declare namespace Blog {
   /** Method to transform rendered text before it's cached and sent */
   export type PostProcess = (text:string) => string;

   /**
    * - `viewName` template name to render
    * - `options` values provided to the template
    * - `postProcess` transform rendered HTML before sending to client
    */
   export type Renderer = (viewName:string, options?:{[key:string]:any}, postProcess?:PostProcess)=>void;
   export type Generator = ()=> string;
   export type RenderCallback = (r:Renderer)=>void;

   /**
    * Options to render or generate content if not found in cache
    */
   export interface RenderOptions {
      mimeType?:string;
      /** Callback to process template renderer output */
      callback?:RenderCallback;
      /** Custom method to generate non-template content like JSON */
      generate?:Generator;
      /** Values that may be rendered with a template */
      templateValues?:{[key:string]:any};
   }

   export interface Response extends ExpressResponse {
      /** Log warning and render not found page */
      notFound():void;

      /**
       * Load output from cache or return template renderer that will capture
       * and cache the output
       */
      sendView(key:string, options:RenderOptions):void;

      /**
       * Load JSON output from cache or call method to build JSON
       */
      sendJson(key:string, render:Renderer):void;

      /**
       * Set headers and write bytes for GZipped response
       *
       * http://condor.depaul.edu/dmumaugh/readings/handouts/SE435/HTTP/node24.html
       */
      sendCompressed(mimeType:string, item:Cache.Item, cache?:boolean):void;

      /** Log error message if given and render error page */
      internalError(err?:Error):void;

      /** JSON response with message and success property set false */
      jsonError(message?:string):void;

      /** JSON response with message and success property set true */
      jsonMessage(message?:string):void;
   }

   export interface Request extends ExpressRequest {
      /**
       * Client IP corrected for forwarding headers
       *
       * http://stackoverflow.com/questions/14382725/how-to-get-the-correct-ip-address-of-a-client-into-a-node-socket-io-app-hosted-o
       */
      clientIP(): string,
   }
}

declare namespace Mock {
   export interface Request extends Blog.Request {
      reset(): void
   }

   export interface Response extends Blog.Request {
      reset(): void,
      headers: { [key: string]: string },
      content: Buffer|string,
      redirected: {
         status: number,
         url: string,
      },
      rendered: {
         template: string,
         options: { [key: string]: string|number },
         json: any
      }
      ended: boolean,
      endOnRender: boolean,
      setHeader(key: string, value: string): Response
   }
}