//import * as Winston from 'winston';

/**
 * https://github.com/jpmonette/feed
 * 
 * TypeScript merges modules and classes that have the same name.
 */
declare class WinstonRedis {
   constructor(options?:WinstonRedis.Options);
}


declare module WinstonRedis {
   interface Options {
      host:string;
      port:string;
      /** Password */
      auth:string
      length:number;
   }
} 

declare module "winston-redis" {
   export = WinstonRedis;
}