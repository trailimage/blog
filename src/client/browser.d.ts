/**
 * Structure of data generated in views/post-menu-data.hbs visible at
 *
 * http://www.trailimage.com/js/post-menu-data.js
 */
export interface PostMenu {
   category:{[key:string]:MenuCategory[]};
   post:{[key:string]:MenuPost};
}

interface MenuCategory {
   title:string;
   posts:string[]
}

interface MenuPost {
   slug:string;
   title:string;
   icon:string;
   description:string;
   subTitle?:string;
   /** Post position if part of a series */
   part?:number;
}

/**
 * Which features to enable on a page — determines which libraries to lazy-load
 */
export interface PageFeature {
   sideMenu:boolean;
   postMenu:boolean;
   twitter:boolean;
   facebook:boolean;
   timestamp:number;
}

/**
 * Used with administration
 */
export interface JsonResponse {
   success:boolean;
   message:string;
}

/**
 * GeoJSON properties for post photos
 */
export interface MapPhoto {
   url?:string;
   title?:string;
   partKey?:string;
}

/**
 * Standard JQuery AJAX response
 */
export type JQueryResponse = (responseText:string, textStatus:string, XMLHttpRequest:XMLHttpRequest) => any;