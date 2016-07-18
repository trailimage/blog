'use strict';

// simplified Redis interface

const is = require('./is');
const log = require('./logger');
const config = require('./config');
const { icon } = require('./enum');
const Redis = require('redis');
const URL = require('url');
const url = URL.parse(config.redis.url);
const client = Redis.createClient(url.port, url.hostname, { max_attempts: 2 });
const code = {
   BROKEN: 'CONNECTION_BROKEN',
   TIMEOUT: 'ETIMEDOUT',
   ERROR: 'ERR'
};

client.on('error', err => {
   let fatal = false;

   if (err.code == code.BROKEN) {
      // if unable to connect to Redis then use in-memory hash only
      log.error("Unable to connect to Redis at %s:%d", url.hostname, url.port);
      fatal = true;
   } else if (err.code == code.ERROR && err.command == 'AUTH') {
      log.error("Unable to authorize Redis at %s:%d (%s)", url.hostname, url.port, err.message);
      fatal = true;
   } else {
      // log error but keep trying to connect
      log.error("Error during redis call: %s", err.message);
   }

   if (fatal) {
      this.ready = false;
      this.emit(Cache.EventType.FATAL);
   }
});

client.on('connect', () => {
   log.infoIcon(icon.link, "Redis connected to %s:%d", url.hostname, url.port);
   this.connected = true;
   this.authorize(url.auth);
   this.emit(Cache.EventType.CONNECTED);
});


this.authorize(url.auth);


module.exports = {
   select(key, callback) { client.get(key, callback); },
   selectMember(key, memberKey, callback) { client.hget(key, memberKey, callback); },
   selectAll(key, callback) { client.hgetall(key, callback); },
   // insert value into hash
   add(key, value, callback) { client.set(key, value, callback); },
   // http://redis.io/commands/hset
   addMember(key, memberKey, value, callback) { client.hset(key, memberKey, value, callback); },
   addAll(key, hash, callback) { client.hmset(key, hash, callback); },
   exists(key, callback) { client.exists(key, callback); },
   memberExists(key, memberKey, callback) { client.hexists(key, memberKey, callback); },
   // keys matching pattern
   keys(pattern, callback) { client.keys(pattern, callback) },
   memberKeys(key, callback) { client.hkeys(key, callback); },

   remove(key, callback) {
      if (is.array(key)) {
         client.hdel(key, callback);
      } else {
         client.del(key, callback);
      }
   },

   /*
    Node redis is a little dumb here and merely toString()'s the field
    array if passed as a second argument so instead combine the key
    and fields which get converted into a list of arguments which is
    what redis server hdel actuall expects
    */
   removeMember(key, memberKey, callback) { client.hdel([key].concat(memberKey), callback); },

   // current client wants password only for auth (auth <username>:<password>)
   authorize(auth) {
      let parts = auth.split(':');
      log.infoIcon(icon.login, "Authenticating Redis connection");
      client.auth(parts[1]);
   },

   // delete one key and add another
   replace(key, p2, p3, p4, p5) {
      if (p5 === undefined) {
         client.multi()
            .del(key)
            .set(p2, this.normalize(p3))
            .exec((err, replies) => {
               log.info('MULTI got %d replies', replies.length);
               replies.forEach((reply, index) => {
                  log.info("Reply %d: %s", index, reply);
               });
            });
      } else {
         // hash
         client.multi()
            .hdel(key, p2)
            .hset(key, p3, this.normalize(p4))
            .exec((err, replies) => {
               log.info('MULTI got %d replies', replies.length);
               replies.forEach((reply, index) => {
                  log.info("Reply %d: %s", index, reply);
               });
            });
      }
   },

   isTrue(value) { return value == 1; },
   isOkay(value) { return value == 'OK'; },

   // normalize data value for cache storage
   normalize(value) {
      if (typeof value == 'object') {
         return (value instanceof Cache.Item) ? value.serialize() : JSON.stringify(value);
      } else {
         return value;
      }
   },

   // deserialize objects as needed
   parseObject(value) {
      if (is.empty(value)) {
         return null;
      } else {
         value = JSON.parse(value);

         if (Cache.Item.isType(value)) {
            return Cache.Item.deserialize(value);
         } else {
            return value;
         }
      }
   },

   disconnect() { client.end(); }
};
