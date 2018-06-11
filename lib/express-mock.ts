import { EventEmitter } from 'events';
import { is } from '@toba/tools';
import { IncomingMessage, ServerResponse, Server } from 'http';

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

export class ExpressApp extends EventEmitter {
   routes: {
      get: Map<string, RequestHandler>;
      post: Map<string, RequestHandler>;
   };

   middleware: Map<string, Middleware> = new Map();

   constructor() {
      super();
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

   init(): void {
      return;
   }

   defaultConfiguration(): void {
      return;
   }

   engine(_ext: string, _fn: Function): this {
      return this;
   }

   set(_setting: string, _val: any): this {
      return this;
   }
   //get: ((name: string) => any) & IRouterMatcher<this>;

   // param(_name: string | string[], h_andler: any): this {
   //    return this;
   // }

   param(_callback: (name: string, matcher: RegExp) => any): this {
      return this;
   }

   path(): string {
      return null;
   }

   enabled(_setting: string): boolean {
      return false;
   }

   disabled(_setting: string): boolean {
      return false;
   }

   enable(_setting: string): this {
      return this;
   }

   disable(_setting: string): this {
      return this;
   }

   configure(fn: Function): this;
   configure(env0: string, fn: Function): this;
   configure(env0: string, env1: string, fn: Function): this;
   configure(env0: string, env1: string, env2: string, fn: Function): this;
   configure(
      env0: string,
      env1: string,
      env2: string,
      env3: string,
      fn: Function
   ): this;
   configure(
      env0: string,
      env1: string,
      env2: string,
      env3: string,
      env4: string,
      fn: Function
   ): this;
   configure(
      _p1: string | Function,
      _p2?: string | Function,
      _p3?: string | Function,
      _p4?: string | Function,
      _p5?: string | Function,
      _p6?: Function
   ): this {
      return this;
   }

   render(
      name: string,
      options?: Object,
      callback?: (err: Error, html: string) => void
   ): void;
   render(_name: string, _callback: (err: Error, html: string) => void): void {
      return;
   }

   listen(
      port: number,
      hostname: string,
      backlog: number,
      callback?: Function
   ): Server;
   listen(port: number, hostname: string, callback?: Function): Server;
   listen(port: number, callback?: Function): Server;
   listen(path: string, callback?: Function): Server;
   listen(handle: any, listeningListener?: Function): Server;
   listen(_p1: any, _p2: any, _p3?: any, _p4?: any): Server {
      return null;
   }
   on: (event: string, callback: (parent: ExpressApp) => void) => this;

   router: string;
   settings: any;
   resource: any;
   map: any;
   locals: any;
   _router: any;
   mountpath: string | string[];
}
