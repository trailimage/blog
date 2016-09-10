'use strict';

const is = require('./is');
const format = require('./format');
const config = require('./config');
const e = require('./constants');
const Winston = require('winston');

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
      _provider = new Winston.Logger({
         transports: config.log.targets.map(t => {
            switch (t) {
               case config.log.type.CONSOLE:
                  return new Winston.transports.Console();
               case config.log.type.REDIS:
                  const URL = require('url');
                  const url = URL.parse(config.redis.url);
                  const RedisTx = require('winston-redis').Redis;
                  return new RedisTx({
                     host: url.hostname,
                     port: url.port,
                     // winston-redis only wants password for auth
                     auth: url.auth.split(':')[1],
                     length: 10000
                  });
            }
         })
      });
   }
   return _provider;
}

/**
 * Append icon as metadata at the end of the arguments
 * @param {String} icon
 * @param {String} level
 * @param args
 * @see https://github.com/winstonjs/winston#logging-with-metadata
 */
function iconInvoke(icon, level, args) {
   let a = Array.from(args);
   a.shift();
   // avoid conflict with handlebars format function called icon()
   a.push({ iconName: icon });
   invoke(level, a);
}

function invoke(l, args) { provider()[l].apply(provider(), args); }

// endregion
// region Reports

/**
 * Group logs by day
 * @param {Object} results
 * @returns {Object.<String, Array>}
 */
function parseLogs(results) {
   // whether two timestamps are the same day
   const sameDay = (d1, d2) => (d1 != null && d2 != null && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
   const grouped = {};

   if (is.defined(results,'redis')) {
      let day = null;
      let dayKey = null;

      for (let r of results.redis) {
         format.logMessage(r, 'message');
         let d = new Date(r.timestamp);
         if (config.isProduction) { d = new Date(d.getTime() + (config.timezone * e.time.HOUR)); }
         let h = d.getHours();

         r.timestamp = format.string('{0}:{1}:{2}.{3} {4}',
            (h > 12) ? h - 12 : h,
            format.leadingZeros(d.getMinutes(), 2),
            format.leadingZeros(d.getSeconds(), 2),
            format.leadingZeros(d.getMilliseconds(), 3),
            (h >= 12) ? 'PM' : 'AM');

         if (!sameDay(day, d)) {
            day = d;
            dayKey = format.string('{0}, {1} {2}', e.weekday[d.getDay()], e.month[d.getMonth()], d.getDate());
            grouped[dayKey] = [];
         }
         grouped[dayKey].push(r);
      }
   }
   return grouped;
}

/**
 * @param {Number} daysAgo
 * @param {Number} maxRows Max rows or callback
 * @param {Function} callback
 */
function query(daysAgo, maxRows, callback) {
   // https://github.com/flatiron/winston/blob/master/lib/winston/transports/transport.js
   const options = {
      from: new Date - (e.time.DAY * daysAgo),
      rows: 500
   };

   provider().query(options, (err, results) => {
      if (err === null) {
         callback(parseLogs(results));
      } else {
         this.ERROR(err.toString());
         callback(null);
      }
   });
}

// endregion

module.exports = {
   info(message, args) { invoke(level.INFO, arguments); },
   infoIcon(icon, message, args) { iconInvoke(icon, level.INFO, arguments); },
   warn(message, args) { invoke(level.WARN, arguments); },
   warnIcon(icon, message, args) { iconInvoke(icon, level.WARN, arguments); },
   error(message, args) { invoke(level.ERROR, arguments); },
   errorIcon(icon, message, args) { iconInvoke(icon, level.ERROR, arguments); },
   query
};