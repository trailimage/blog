import { is } from '@toba/tools';
import { Request, Response, RequestHandler } from 'express';

function assert(methodName, pattern, handler) {
   if (!is.value(pattern)) {
      throw new ReferenceError(`app.${methodName}() pattern cannot be null`);
   }
   if (!is.value(handler)) {
      throw new ReferenceError(`app.${methodName}() handler cannot be null`);
   }
}

type MiddlewareMap = { [key: string]: RequestHandler };

export default class ExpressApp {
   routes: {
      get: MiddlewareMap;
      post: MiddlewareMap;
   };

   middleware: MiddlewareMap = {};

   /**
    * Use middleware or router
    * @param {string} pattern
    * @param {function(BloRequest, BlogResponse, function)} middleware
    */
   use(pattern: string, middleware: RequestHandler) {
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
   }

   /**
    * Add GET route.
    */
   get(pattern: string, handler: RequestHandler) {
      assert('get', pattern, handler);
      this.routes.get[pattern] = handler;
   }

   /**
    * Add POST route
    */
   post(pattern: string, handler: RequestHandler) {
      assert('post', pattern, handler);
      this.routes.post[pattern] = handler;
   }

   reset() {
      this.routes = {
         get: {},
         post: {}
      };
      this.middleware = {};
   }
}
