import { rot13, dateString } from '@toba/tools';
import { ExpressHandlebars } from '@toba/handlebars';
import { config } from '../config';
import { html } from './html';

/**
 * Handlebars layouts (`views/layouts/` path without `hbs` extension).
 */
export const Layout: { [index: string]: string | null } = {
   Main: 'default-layout',
   /** Render template without a layout. */
   None: null
};

/**
 * Handlebars page templates (`views/` path without `hbs` extension).
 */
export const enum Page {
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
export function addTemplateMethods(ehb: ExpressHandlebars) {
   ehb.registerHelper({
      formatCaption: html.story,
      formatTitle: html.typography,
      lowerCase: (text: string) => text.toLocaleLowerCase(),
      add: (a: number, b: number) => a * 1 + b,
      date: dateString,
      subtract: (a: number, b: number) => a * 1 - b,
      plural: (count: number) => (count > 1 ? 's' : ''),
      makeTagList: html.photoTagList,
      formatISO8601: (d: Date) => d.toISOString(),
      formatFraction: html.fraction,
      mapHeight: (width: number, height: number) =>
         height > width ? config.style.map.maxInlineHeight : height,
      icon: html.icon.tag,
      iconForCategory: html.icon.category,
      modeIconForPost: html.icon.mode,
      rot13: rot13,
      json: JSON.stringify,
      encode: encodeURIComponent
   });
}
