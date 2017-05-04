/**
 * https://github.com/winstonjs/winston-redis
 */
declare module "winston-redis" {
   interface Options {
       host:string;
       port:string;
       /** Password */
       auth:string;
       length:number;
   }

   export class Redis {
      constructor(options:Options);
   }
}