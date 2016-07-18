'use strict';

// Handlebars templates

module.exports = {
   layout: {
      main: 'layouts/default-layout',
      none: null
   },
   page: {
      notFound: 'error/404',
      internalError: 'error/500',
      error: '503',
      about: 'about',
      administration: 'admin',
      authorize: 'authorize',
      exif: 'exif',
      tagMenu: 'tag-menu',
      postMenuData: 'post-menu-data',
      mobileMenuData: 'mobile-menu-data',
      post: 'post',
      postTag: 'post-tag',
      postTagCategory: 'post-tag-category',
      photoTag: 'photo-tag',
      photoSearch: 'photo-search',
      map: 'map',
      search: 'search',
      sitemap: 'sitemap-xml'
   },
   assignHelpers: function(hbs) {
      const format = require('./utils/format');
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
         iconForPostTag: title => format.postTagIcon(title),
         modeIconForPost: tags => format.postModeIcon(tags),
         rot13: text => format.rot13(text),
         encode: text => encodeURIComponent(text)
      };
      for (let name in helpers) { hbs.registerHelper(name, helpers[name]); }
   }
};