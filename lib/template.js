'use strict';

// Handlebars templates

module.exports = {
   layout: {
      MAIN: 'layouts/default-layout',
      NONE: null
   },
   page: {
      NOT_FOUND: 'error/404',
      INTERNAL_ERROR: 'error/500',
      ERROR: '503',
      ABOUT: 'about',
      ADMINISTRATION: 'admin',
      AUTHORIZE: 'authorize',
      EXIF: 'exif',
      CATEGORY_MENU: 'category-menu',
      POST_MENU_DATA: 'post-menu-data',
      MOBILE_MENU_DATA: 'mobile-menu-data',
      POST: 'post',
      CATEGORY: 'category',
      CATEGORY_LIST: 'category-list',
      PHOTO_TAG: 'photo-tag',
      PHOTO_SEARCH: 'photo-search',
      MAP: 'map',
      SEARCH: 'search',
      SITEMAP: 'sitemap-xml'
   },
   assignHelpers: function(hbs) {
      const util = require('./util');
      const config = require('./config');
      // methods exposed to Handlebars template
      const helpers = {
         formatCaption: text => util.html.story(text),
         formatTitle: text => util.html.typography(text),
         lowerCase: text => text.toLocaleLowerCase(),
         add: (a, b) => (a * 1) + b,
         date: d => util.date(d),
         subtract: (a, b) => (a * 1) - b,
         plural: count => (count > 1) ? 's' : '', //makeSlug: text => exports.slug(text),
         makeTagList: list => util.html.tagList(list),
         formatLogTime: text => util.date.toLogTime(text),
         formatISO8601: d => d.toISOString(),
         formatFraction: text => util.html.fraction(text),
         mapHeight: (width, height) => height > width ? config.style.map.maxInlineHeight : height,
         icon: name => util.icon(name),
         iconForCategory: title => util.icon.category(title),
         modeIconForPost: categories => util.icon.mode(categories),
         rot13: text => util.encode.rot13(text),
         encode: text => encodeURIComponent(text)
      };
      for (let name in helpers) { hbs.registerHelper(name, helpers[name]); }
   }
};