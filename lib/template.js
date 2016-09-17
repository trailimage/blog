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
      CATEGORY_MENU: 'tag-menu',
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
      const format = require('./format');
      const config = require('./config');
      // methods exposed to Handlebars template
      const helpers = {
         formatCaption: text => format.story(text),
         formatTitle: text => format.typography(text),
         lowerCase: text => text.toLocaleLowerCase(),
         add: (a, b) => (a * 1) + b,
         date: d => format.date(d),
         subtract: (a, b) => (a * 1) - b,
         plural: count => (count > 1) ? 's' : '', //makeSlug: text => exports.slug(text),
         makeTagList: list => format.tagList(list),
         formatLogTime: text => format.logTime(text),
         formatISO8601: d => d.toISOString(),
         formatFraction: text => format.fraction(text),
         mapHeight: (width, height) => height > width ? config.style.map.maxInlineHeight : height,
         icon: name => format.icon(name),
         iconForCategory: title => format.postCategoryIcon(title),
         modeIconForPost: categories => format.postModeIcon(categories),
         rot13: text => format.rot13(text),
         encode: text => encodeURIComponent(text)
      };
      for (let name in helpers) { hbs.registerHelper(name, helpers[name]); }
   }
};