/// <reference types="jquery" />
/// <reference path="../types/jquery/index.d.ts"/>

/**
 * Structure of data generated in views/post-menu-data.hbs visible at
 *
 * http://www.trailimage.com/js/post-menu-data.js
 */
interface PostMenu {
   category: { [key:string]:MenuCategory[] };
   post: { [key:string]:MenuPost };
}

interface MenuCategory {
   title:string;
   posts:string[]
}

/**
 * Post data within menu.
 */
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
interface PageFeature {
   sideMenu:boolean;
   postMenu:boolean;
   twitter:boolean;
   facebook:boolean;
   timestamp:number;
}

/**
 * Standard response for administrative actions.
 */
interface JsonResponse {
   success:boolean;
   message:string;
}

/**
 * GeoJSON properties for post photos.
 */
interface MapPhoto {
   url?:string;
   title?:string;
   partKey?:string;
   /** Distance from clicked cluster */
   distance?:number;
}

/**
 * Object generated in `mapbox.hbs` to display post details on the map.
 */
interface MapPost {
   key:string;
   photoID:number;
   bounds:{
      /**
       * Southwest corner as lon, lat. For the U.S. this is the smallest
       * longitude and latitude values.
       */
      sw:number[];
      /**
       * Northeast corner as lon, lat. For the U.S. this is the largest
       * longitude and latitude values.
       */
      ne:number[];
   };
}

interface PointCluster { point_count?: number; }

interface UrlPosition {
   [key: string]: number | number[];
   /** longitude, latitude */
   center?:number[];
   lon?:number;
   lat?:number;
   zoom?:number;
}
interface FakeEvent { reason:string; }

interface CssPosition { top:number; left:number; }

/**
 * Standard JQuery AJAX response
 */
type JQueryResponse = (responseText:string, textStatus:string, XMLHttpRequest:XMLHttpRequest) => any;
