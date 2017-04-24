import {EventEmitter} from "events";
import {Response, Request} from "express";

export interface FlickrOptions {
   value(r: Flickr.Response): Object,
   sign: boolean,
   allowCache: boolean,
   error: string,
   args: Object
}

export interface ViewCacheItem {
   buffer: Buffer,
   eTag: string
}

export interface BlogRequest extends Request {
   clientIP(): string,
}

interface Renderer {

}

export interface BlogResponse extends Response {
   notFound(): void,
   internalError(): void,
   sendView(key: string, p2: string|Object|Renderer, p3?: Renderer): void,
   sendJson(key: string, render: Renderer): void,
   sendCompressed(mimeType: string, item: ViewCacheItem, cache?: boolean): void,
   jsonError(message: string),
   jsonMessage(message: string)
}

export interface MockRequest extends BlogRequest {
   reset(): void
}

export interface MockResponse extends BlogRequest {
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
   setHeader(key: string, value: string): MockResponse
}