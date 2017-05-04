// Writing definition files:
// https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html

import { MapDataType } from '../constants';

export { Flickr } from '../providers/flickr.d';
export { Cache } from '../cache/cache';
export { Provider, Token } from '../providers/providers';
export { Blog, Mock } from '../middleware.d';
export { JsonLD } from '../json-ld.d';
export {
   PostMenu,
   PageFeature,
   JsonResponse,
   JQueryResponse,
   MapPhoto } from '../client/browser';
export {
   Library,
   Category,
   Post,
   Photo,
   Size,
   VideoInfo,
   EXIF } from '../factory/models';

export interface MapSource {
   name:string;
   provider:string;
   type?:MapDataType;
   url:string;
}

export interface MapProperties {
   [key:string]:string|number;
   description?:string;
}