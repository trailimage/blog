const is = require('../../lib/is').default;

function assert(methodName, pattern, handler) {
   if (!is.value(pattern)) { throw new ReferenceError(`app.${methodName}() pattern cannot be null`); }
   if (!is.value(handler)) { throw new ReferenceError(`app.${methodName}() handler cannot be null`); }
}

module.exports = {
   routes: {
      get: {},
      post: {}
   },
   middleware: {},

   /**
    * Use middleware or router
    * @param {string} pattern
    * @param {function(BlogRequest, BlogResponse, function)} middleware
    */
   use(pattern, middleware) {
      assert('use', pattern, middleware);
      this.middleware[pattern] = middleware;

      if (is.defined(middleware, 'name') && middleware.name == 'router' && is.defined(middleware, 'stack')) {
         middleware.stack.reduce((routes, s) => {
            const handler = s.route.stack[0];
            routes[handler.method][pattern + s.route.path] = handler.handle;
            return routes;
         }, this.routes);
      }
   },
   /**
    * Add GET route
    * @param {string} pattern
    * @param {function(BlogRequest, BlogResponse)} handler
    */
   get(pattern, handler) {
      assert('get', pattern, handler);
      this.routes.get[pattern] = handler;
   },

   /**
    * Add POST route
    * @param {string} pattern
    * @param {function(BlogRequest, BlogResponse)} handler
    */
   post(pattern, handler) {
      assert('post', pattern, handler);
      this.routes.post[pattern] = handler;
   },

   reset() {
      this.routes = {
         get: {},
         post: {}
      };
      this.middleware = {};
   }
};