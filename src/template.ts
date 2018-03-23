import util from './util/';
import config from './config';

/**
 * Handlebars layouts.
 */
export enum Layout {
   Main = 'layouts/default-layout',
   None = ''
}

/**
 * Handlebars page templates.
 */
export enum Page {
   NotFound = 'error/404',
   InternalError = 'error/500',
   Error = '503',
   About = 'about',
   Administration = 'admin',
   Authorize = 'authorize',
   EXIF = 'exif',
   CategoryMenu = 'category-menu',
   PostMenuData = 'post-menu-data',
   MobileMenuData = 'mobile-menu-data',
   Post = 'post',
   Category = 'category',
   CategoryList = 'category-list',
   PhotoTag = 'photo-tag',
   PhotoSearch = 'photo-search',
   //MAP: 'map',
   Mapbox = 'mapbox',
   Search = 'search',
   Sitemap = 'sitemap-xml'
}

/**
 * Assign methods that will be available from within Handlebars templates.
 */
export function addTemplateMethods(hbs: any) {
   const helpers: { [key: string]: Function } = {
      formatCaption: util.html.story,
      formatTitle: util.html.typography,
      lowerCase: (text: string) => text.toLocaleLowerCase(),
      add: (a: number, b: number) => a * 1 + b,
      date: util.date.toString,
      subtract: (a: number, b: number) => a * 1 - b,
      plural: (count: number) => (count > 1 ? 's' : ''),
      makeTagList: util.html.photoTagList,
      formatLogTime: util.date.toLogTime,
      formatISO8601: (d: Date) => d.toISOString(),
      formatFraction: util.html.fraction,
      mapHeight: (width: number, height: number) =>
         height > width ? config.style.map.maxInlineHeight : height,
      icon: util.icon.tag,
      iconForCategory: util.icon.category,
      modeIconForPost: util.icon.mode,
      rot13: util.encode.rot13,
      json: JSON.stringify,
      encode: encodeURIComponent
   };
   for (const name in helpers) {
      hbs.registerHelper(name, helpers[name]);
   }
}
