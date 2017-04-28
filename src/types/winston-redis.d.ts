/**
 * https://github.com/winstonjs/winston-redis
 * 
 * TypeScript merges modules and classes that have the same name.
 */
declare class WinstonRedis {
   constructor(options:any);
}

declare module WinstonRedis {} 

declare module "winston-redis" {
   import * as Winston from 'winston';
   
   // class WinstonRedis extends NodeJS.EventEmitter implements Winston.TransportInstance {
   //    constructor(options?:Winston.TransportOptions);
   //    //new(options?:Winston.TransportOptions):Winston.TransportInstance;

   //    silent: boolean;
   //    raw: boolean;
   //    name: string;
   //    level?: string;
   //    handleExceptions: boolean;
   //    exceptionsLevel: string;
   //    humanReadableUnhandledException: boolean;

   //    formatQuery(query: (string | Object)): (string | Object);
   //    formatter?(options?: any): string;
   //    normalizeQuery(options: Winston.QueryOptions): Winston.QueryOptions;
   //    formatResults(results: (Object | any[]), options?: Object): (Object | any[]);
   //    logException(msg: string, meta: Object, callback: () => void): void;
   // }

   // interface WinstonRedis extends Winston.TransportInstance {
      
   // }

   export = WinstonRedis;
}