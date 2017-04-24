import {Flickr} from './providers/flickr.d';
import {EventEmitter} from "events";
import {
   Response as ExpressResponse,
   Request as ExpressRequest } from "express";

export interface FlickrOptions {
   value(r: Flickr.Response): Object,
   sign: boolean,
   allowCache: boolean,
   error: string,
   args: Object
}

export interface ViewCacheItem {
   buffer:Buffer|string;
   eTag:string;
}

interface Renderer {

}

declare namespace Blog {
   export interface Response extends ExpressResponse {
      notFound(): void,
      internalError(): void,
      sendView(key: string, p2: string|Object|Renderer, p3?: Renderer): void,
      sendJson(key: string, render: Renderer): void,
      sendCompressed(mimeType: string, item: ViewCacheItem, cache?: boolean): void,
      jsonError(message:string):void,
      jsonMessage(message:string):void
   }

   export interface Request extends ExpressRequest {
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