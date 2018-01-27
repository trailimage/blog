import is from '../is';
import { Blog } from '../types';

function assert(methodName: string, pattern: string, handler: Function) {
   if (!is.value(pattern)) {
      throw new ReferenceError(`app.${methodName}() pattern cannot be null`);
   }
   if (!is.value(handler)) {
      throw new ReferenceError(`app.${methodName}() handler cannot be null`);
   }
}

export default {
   routes: {
      get: {},
      post: {}
   },
   middleware: {},

   /**
    * Use middleware or router
    */
   use(
      pattern: string,
      middleware: (req: Blog.Request, res: Blog.Response, cb: Function) => {}
   ) {
      assert('use', pattern, middleware);
      this.middleware[pattern] = middleware;

      if (
         is.defined(middleware, 'name') &&
         middleware.name == 'router' &&
         is.defined(middleware, 'stack')
      ) {
         middleware.stack.reduce((routes, s) => {
            const handler = s.route.stack[0];
            routes[handler.method][pattern + s.route.path] = handler.handle;
            return routes;
         }, this.routes);
      }
   },
   /**
    * Add GET route
    */
   get(pattern: string, handler: Blog.Handler) {
      assert('get', pattern, handler);
      this.routes.get[pattern] = handler;
   },

   /**
    * Add POST route
    */
   post(pattern: string, handler: Blog.Handler) {
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
