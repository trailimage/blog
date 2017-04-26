import { Flickr as f, Post } from '../types';
import * as Stream from 'stream';

export interface Token {
   type:string;
   access:string;
   secret?:string;
   request?:string;
   refresh?:string;
   accessExpiration:Date;
}

export namespace Provider {
   export interface Flickr {
      getCollections():Promise<f.Collection[]>;
      getSetInfo(id:string):Promise<f.SetInfo>;
      getPhotoSizes(id:string):Promise<f.Size[]>;
      getPhotoContext(id:string):Promise<f.MemberSet[]>;
      getExif(id:number):Promise<f.PhotoExif>;
      getSetPhotos(id:string):Promise<f.SetPhotos>;
      photoSearch(tags:string|string[]):Promise<f.PhotoSummary[]>;
      getAllPhotoTags():Promise<f.Tag[]>;
   }

   export interface Google {
      drive: {
         loadGPX(post:Post, stream:Stream.Writable):Promise<string>;
      }
   }
}