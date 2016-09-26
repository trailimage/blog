import {EventEmitter} from "events";
import {Response} from "express";
import {Request} from "express";

interface FlickrOptions {
   value(r: Flickr.Response): Object,
   sign: boolean,
   allowCache: boolean,
   error: string,
   args: Object
}

//region IO

interface ViewCacheItem {
   buffer: Buffer,
   eTag: string
}

interface BlogRequest extends Request {
   clientIP(): string,
}

interface Renderer {

}

interface BlogResponse extends EventEmitter, Response {
   notFound(): void,
   internalError(): void,
   sendView(key: string, p2: string|Object|Renderer, p3?: Renderer): void,
   sendJson(key: string, render: Renderer): void,
   sendCompressed(mimeType: string, item: ViewCacheItem, cache?: boolean): void,
   jsonError(message: string),
   jsonMessage(message: string)
}

interface MockRequest extends BlogRequest {
   reset(): void,
   connection: Object
}

interface MockResponse extends BlogRequest {
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

//endregion
//region Models

interface Category {
   title: string,
   key: string,
   subcagtegories: Category[],
   posts: Post[],
   isChild: boolean,
   isParent: boolean,
   add(subcategory: Category): void,
   getSubcagtegory(key: string): Category,
   removePost(post: Post): Category,
}

interface EXIF {
   artist: string,
   compensation: number,
   time: number,
   fNumber: number,
   focalLength: number,
   ISO: number,
   lens: string,
   model: string,
   software: string,
   sanitized: boolean
}

interface Library {
   categories: { [key: string]: Category },
   posts: Post[],
   tags: { [key: string]: string },
   loaded: boolean,
   postInfoLoaded: boolean,
   empty(): Library
}

interface Photo {
   id: string,
   index: number,
   sourceUrl: string,
   title: string,
   description: string,
   tags: string[],
   dateTaken: Date,
   latitude: number,
   longitude: number,
   primary: boolean,
   size: { [key: string]: Size },
   preview: Size,
   normal: Size,
   big: Size,
   getExif(): Promise
}

interface Post {
   id: string,
   key: string,
   seriesKey: string,
   partKey: string,
   chronological: boolean,
   originalTitle: string,
   photosLoaded: boolean,
   photos: Photo[],
   photoCount: number,
   coverPhoto: Photo,
   feature: boolean,
   categories: Category[],
   hasCategories: boolean,
   infoLoaded: boolean,
   triedTrack: boolean,
   hasTrack: boolean,
   next?: Post,
   previous?: Post,
   part: number,
   isPartial: boolean,
   nextIsPart: boolean,
   previousIsPart: boolean,
   totalParts: number,
   isSeriesStart: boolean,
   photoCoordinates: string,
   makeSeriesStart(): Post,
   ungroup(): Post,
   empty(): Post,
   name(): string,
   getInfo(): Promise<Post>,
   getPhotos(): Promise<Post>,
   hasKey(key: string): boolean,
   hasPhotoID(id: string): boolean,
   serializePhotoCoordinates(): Post
}

interface Size {
   url: string,
   width: number,
   height: number,
   isEmpty: boolean
}

//endregion