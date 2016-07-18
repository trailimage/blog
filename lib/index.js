'use strict';

const load = require('./loader')();
let _provider = null;

// so extensions are always applied
require('./extensions.js');

// use getters to delay module initialization and avoid circular dependencies
module.exports = Object.assign({}, require('./enum'), {
   get is() { return load('is'); },
   get re() { return load('regex'); },
   get format() { return load('format'); },
   get config() { return load('config'); },
   get log() { return this.active.log; },
   get cache() { return this.active.cache; },

   template: require('./template.js'),

   PDF: require('./pdf'),
   provider: require('./providers'),
   map: require('./map'),
   linkData: require('./json-ld'),
   auth: require('./auth'),
   factory: require('./models'),
   middleware: require('./middleware'),
   controller: require('./controllers'),

   photo: require('./models/photo.js'),
   photoSize: require('./models/photo-size.js'),
   postTag: require('./models/post-tag.js'),
   video: require('./models/video.js'),

   // dependency injected providers
   get active() {
      if (_provider === null) {
         const ProviderManager = require('./providers/provider-manager.js');
         _provider = new ProviderManager();
      }
      return _provider;
   },

   get EXIF() { return require('./models/exif.js'); },
   get library() { return require('./models/library.js'); },
   get post() { return require('./models/post.js'); }
});