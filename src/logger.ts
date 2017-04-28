import is from './is';
import util from './util';
import config from './config';
import { logTo, time, month, weekday } from './constants';
import * as URL from 'url';
import * as Winston from 'winston';
import * as RedisTx from 'winston-redis';

/**
 * Whether log provider can be queried
 */
let queryable = false;

declare global {
   namespace Winston {
      export interface LoggerInstance { [key:string]:string; }
   }
}

const level = {
   DEBUG: 'debug',
   INFO: 'info',
   WARN: 'warn',
   ERROR: 'error'
};

let logger:Winston.LoggerInstance = null;

function provider() {
   if (logger === null) {
      // initialize selected transports and create logger
      logger = new Winston.Logger({
         transports: config.log.targets.map(t => {
            switch (t) {
               case logTo.CONSOLE:
                  return new Winston.transports.Console();
               case logTo.REDIS:
                  // https://github.com/winstonjs/winston-redis
                  const url = URL.parse(config.redis.url);
                  const tx:WinstonRedis = new RedisTx({
                     host: url.hostname,
                     port: url.port,
                     // winston-redis only wants password for auth
                     auth: url.auth.split(':')[1],
                     length: 10000
                  });

                  tx.on('error', (err:Error) => {
                     // replace Redis transport with console
                     try {
                        const r = logger.transports[logTo.REDIS];
                        logger.remove(r);
                     } catch (err) {
                        console.error('Unable to remove Redis logger');
                     }
                     try {
                        logger.add(new Winston.transports.Console());
                     } catch (err) {
                        console.error(err);
                     }
                     //logger[level.ERROR]('Reverting logs to console', err.stack);
                  });

                  queryable = true;

                  return tx;
               case logTo.FILE:

            }
         })
      });
   }
   return logger;
}

/**
 * Append icon as metadata at the end of the arguments
 *
 * See https://github.com/winstonjs/winston#logging-with-metadata
 */
function iconInvoke(icon:string, level:string, args:IArguments) {
   const a = Array.from(args);
   a.shift();
   // avoid conflict with handlebars format function called icon()
   a.push({ iconName: icon });
   invoke(level, a);
}

function invoke(level:string, ...args:any[]) {
   provider()[l].apply(provider(), args);
}

/**
 * Group logs by day
 */
function parseLogs(results:any):{[key:string]:string[]} {
   // whether two timestamps are the same day
   const sameDay = (d1:Date, d2:Date) =>
      (d1 != null && d2 != null && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
   const grouped:{[key:string]:string[]} = {};

   if (is.defined(results, 'redis')) {
      let day = null;
      let dayKey = null;

      for (const r of results.redis) {
         util.logMessage(r, 'message');
         const d = new Date(r.timestamp);
         const h = d.getHours();

         r.timestamp = util.format('{0}:{1}:{2}.{3} {4}',
            (h > 12) ? h - 12 : h,
            util.number.pad(d.getMinutes(), 2),
            util.number.pad(d.getSeconds(), 2),
            util.number.pad(d.getMilliseconds(), 3),
            (h >= 12) ? 'PM' : 'AM');

         if (!sameDay(day, d)) {
            day = d;
            dayKey = util.format('{0}, {1} {2}', weekday[d.getDay()], month[d.getMonth()], d.getDate());
            grouped[dayKey] = [];
         }
         grouped[dayKey].push(r);
      }
   }
   return grouped;
}

function query(daysAgo:number, maxRows = 500) {
   // https://github.com/flatiron/winston/blob/master/lib/winston/transports/transport.js
   const options:Winston.QueryOptions = {
      from: new Date((new Date()).getTime() - (time.DAY * daysAgo)),
      rows: maxRows,
      fields: null
   };

   return new Promise((resolve, reject) => {
      if (queryable) {
         provider().query(options, (err, results) => {
            if (err === null) {
               resolve(parseLogs(results));
            } else {
               this.error(err.toString());
               reject(err);
            }
         });
      } else {
         resolve();
      }
   });
}

export default {
   info(message:string, ...args:any[]) { invoke(level.INFO, arguments); },
   /** Log information message with a Material icon attribute */
   infoIcon(icon:string, message:string, ...args:any[]) { iconInvoke(icon, level.INFO, arguments); },
   warn(message:string, ...args:any[]) { invoke(level.WARN, arguments); },
   /** Log warning with a Material icon attribute */
   warnIcon(icon:string, message:string, ...args:any[]) { iconInvoke(icon, level.WARN, arguments); },
   error(message:string|Error, ...args:any[]) { invoke(level.ERROR, arguments); },
   /** Log error with a Material icon attribute */
   errorIcon(icon:string, message:string|Error, ...args:any[]) { iconInvoke(icon, level.ERROR, arguments); },
   query,
   /** Force provider(s) to be re-initialized */
   reset() { logger = null; }
};