import { is } from '@toba/tools';
import { IncomingMessage, ServerResponse } from 'http';

enum HandlerType {
   Route = 'router'
}

interface NextFunction {
   (err?: any): void;
}

interface RequestHandler {
   (req: IncomingMessage, res: ServerResponse, next: NextFunction): any;
}

interface Middleware extends RequestHandler {
   name: HandlerType;
   /** Internal stack of handlers */
   stack: any[];
}

class ExpressApp {
   routes: {
      get: Map<string, RequestHandler>;
      post: Map<string, RequestHandler>;
   };

   middleware: Map<string, Middleware> = new Map();

   constructor() {
      this.reset();
   }

   /**
    * Use middleware or router.
    */
   use(pattern: string, middleware: Middleware) {
      this.middleware.set(pattern, middleware);

      if (
         is.defined(middleware, 'name') &&
         middleware.name == 'router' &&
         is.defined(middleware, 'stack')
      ) {
         middleware.stack.reduce((routes, s) => {
            const handler = s.route.stack[0];
            routes[handler.method].set(pattern + s.route.path, handler.handle);
            return routes;
         }, this.routes);
      }
   }

   /**
    * Add `GET` route
    */
   get(pattern: string, handler: RequestHandler) {
      this.routes.get.set(pattern, handler);
   }

   /**
    * Add `POST` route.
    */
   post(pattern: string, handler: RequestHandler) {
      this.routes.post.set(pattern, handler);
   }

   reset() {
      this.routes = {
         get: new Map(),
         post: new Map()
      };
      this.middleware = new Map();
   }
}

export default function() {
   return new ExpressApp();
}
