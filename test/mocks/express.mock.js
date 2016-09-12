'use strict';

module.exports = {
   routes: {
      get: {},
      post: {}
   },
   middleware: {

   },

   /**
    * Use middleware or router
    * @param {String} pattern
    * @param {function(BlogRequest, BlogResponse, function)} middleware
    */
   use(pattern, middleware) {
      // TODO detect if middleware is Express router and add to standard routes
   },
   /**
    * Add GET route
    * @param {String} pattern
    * @param {function(BlogRequest, BlogResponse)} handler
    */
   get(pattern, handler) { this.routes.get[pattern] = handler; },
   /**
    * Add POST route
    * @param {String} pattern
    * @param {function(BlogRequest, BlogResponse)} handler
    */
   post(pattern, handler) { this.routes.post[pattern] = handler; },

   reset() {
      this.routes = {
         get: {},
         post: {}
      };
      this.middleware = {}
   }
};