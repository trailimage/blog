import is from './is';
import util from './util';
import config from './config';
import C from './constants';
import winston from 'winston';

let queryable = false;

// region Invoke provider

const level = {
   DEBUG: 'debug',
   INFO: 'info',
   WARN: 'warn',
   ERROR: 'error'
};

let _provider = null;

function provider() {
   if (_provider === null) {
      // initialize selected transports and create logger
      _provider = new winston.Logger({
         transports: config.log.targets.map(t => {
            switch (t) {
               case C.logTo.CONSOLE:
                  return new winston.transports.Console();
               case C.logTo.REDIS:
                  // https://github.com/winstonjs/winston-redis
                  const URL = require('url');
                  const url = URL.parse(config.redis.url);
                  const RedisTx = require('winston-redis').Redis;
                  const tx = new RedisTx({
                     host: url.hostname,
                     port: url.port,
                     // winston-redis only wants password for auth
                     auth: url.auth.split(':')[1],
                     length: 10000
                  });

                  tx.on('error', err => {
                     // replace Redis transport with console
                     try { _provider.remove(C.logTo.REDIS); } catch(err) {}
                     try { _provider.add(new winston.transports.Console()); } catch(err) {}
                     _provider[level.ERROR]('Reverting logs to console', err.stack);
                  });

                  queryable = true;

                  return tx;
               case C.logTo.FILE:

            }
         })
      });
   }
   return _provider;
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

function invoke(l:string, ...args:any[]) { provider()[l].apply(provider(), args); }

/**
 * Group logs by day
 * @param {Object} results
 * @returns {Object.<String, Array>}
 */
function parseLogs(results) {
   // whether two timestamps are the same day
   const sameDay = (d1:Date, d2:Date) => (d1 != null && d2 != null && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
   const grouped = {};

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
            dayKey = util.format('{0}, {1} {2}', C.weekday[d.getDay()], C.month[d.getMonth()], d.getDate());
            grouped[dayKey] = [];
         }
         grouped[dayKey].push(r);
      }
   }
   return grouped;
}

function query(daysAgo:number, maxRows = 500) {
   // https://github.com/flatiron/winston/blob/master/lib/winston/transports/transport.js
   const options = {
      from: new Date() - (C.time.DAY * daysAgo),
      rows: maxRows
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
   infoIcon(icon:string, message:string, ...args:any[]) { iconInvoke(icon, level.INFO, arguments); },
   warn(message:string, ...args:any[]) { invoke(level.WARN, arguments); },
   warnIcon(icon:string, message:string, ...args:any[]) { iconInvoke(icon, level.WARN, arguments); },
   error(message:string|Error, ...args:any[]) { invoke(level.ERROR, arguments); },
   errorIcon(icon:string, message:string|Error, ...args:any[]) { iconInvoke(icon, level.ERROR, arguments); },
   query,
   // force provider(s) to be re-initialized
   reset() { _provider = null; }
};