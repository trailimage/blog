import * as winston from 'winston';
import * as redis from 'winston-redis';

declare module 'winston' {
   /**
    * It isn't publicly declared but internally the log level writers are
    * stored in an object keyed to the level name.
    */
   export interface LoggerInstance { [key:string]:Function; }

   // interface LoggerOptions {
   //    transports: TransportInstance[]|WinstonRedis[];
   // }
}
