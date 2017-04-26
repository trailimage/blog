declare module "winston-redis" {
   import * as Winston from 'winston';

   interface Options {
      host:string;
      port:string;
      /** Password */
      auth:string
      length:number;
   }

   export interface Redis extends Winston.TransportInstance {
      new(options?:Options):Redis;
   }
}