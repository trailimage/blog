declare namespace WinstonRedis {
   interface Options {
       host:string;
       port:string;
       /** Password */
       auth:string;
       length:number;
   }
}
declare class WinstonRedis {
   constructor(options:WinstonRedis.Options);
}

/**
 * https://github.com/winstonjs/winston-redis
 */
declare module "winston-redis" {
   export = WinstonRedis;
}