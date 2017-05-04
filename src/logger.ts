import is from './is';
import util from './util';
import config from './config';
import { logTo, time, month, weekday } from './constants';
import * as URL from 'url';
import * as Winston from 'winston';
import { Redis as RedisTx } from 'winston-redis';

/**
 * Whether log provider can be queried
 */
let queryable = false;

const level = {
   DEBUG: 'debug',
   INFO: 'info',
   WARN: 'warn',
   ERROR: 'error'
};

// const RedisTx = require('winston-redis').Redis;
// const tx = new RedisTx({

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
                  const tx = new RedisTx({
                     host: url.hostname,
                     port: url.port,
                     // winston-redis only wants password for auth
                     auth: url.auth.split(':')[1],
                     length: 10000
                  }) as Winston.TransportInstance;

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
 * https://github.com/winstonjs/winston#logging-with-metadata
 */
function iconInvoke(icon:string, level:string, message:string|Error, args:any[]) {
   // avoid conflict with handlebars format function called icon()
   args.push({ iconName: icon });
   invoke(level, message, args);
}

/**
 * Apply arguments to log writer function keyed to severity level
 */
function invoke(l:string, message:string|Error, args:any[]) {
   args.unshift(message);
   const p = provider();
   switch (l) {
      case level.DEBUG: p.debug.apply(p, args); break;
      case level.INFO: p.info.apply(p, args); break;
      case level.WARN: p.warn.apply(p, args); break;
      case level.ERROR: p.error.apply(p, args); break;
   }
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
               error(err.toString());
               reject(err);
            }
         });
      } else {
         resolve();
      }
   });
}

function error(message:string|Error, ...args:any[]) { invoke(level.ERROR, message, args); }

export default {
   info(message:string, ...args:any[]) { invoke(level.INFO, message, args); },
   /** Log information message with a Material icon attribute */
   infoIcon(icon:string, message:string, ...args:any[]) { iconInvoke(icon, level.INFO, message, args); },
   warn(message:string, ...args:any[]) { invoke(level.WARN, message, args); },
   /** Log warning with a Material icon attribute */
   warnIcon(icon:string, message:string, ...args:any[]) { iconInvoke(icon, level.WARN, message, args); },
   error,
   /** Log error with a Material icon attribute */
   errorIcon(icon:string, message:string|Error, ...args:any[]) { iconInvoke(icon, level.ERROR, message, args); },
   query,
   /** Force provider(s) to be re-initialized */
   reset() { logger = null; },

   inject: {
      set transport(t:Winston.TransportInstance) {
          logger = new Winston.Logger({ transports: [t] });
      }
   }
};