import { Cache } from '../types';
import config from '../config';
import item from './item';
import redis from '../providers/redis';

const viewKey = 'view';

function addItem(key:string, hashKey:string, value:string|GeoJSON.FeatureCollection<any>, enabled:boolean) {
   item
      .create(hashKey, value)
      .then(item => (enabled) ? redis.add(key, hashKey, item) : Promise.resolve(item));
}

/**
 * Whether key with prefix exists
 */
const exists = (key:string, hashKey:string, enabled:boolean) => enabled
   ? redis.exists(key, hashKey)
   : Promise.resolve(false);


const provider:Cache.Provider = {
   getItem: (key:string) => redis.getObject(viewKey, key).then(item.deserialize),
   keys: ()=> redis.keys(viewKey),

   /**
    * Add or replace value at key
    */
   add: (key:string, text:string) => addItem(viewKey, key, text, config.cache.views),

   create: item.create,

   /**
    * Whether cache view exists
    */
   exists: (key:string) => exists(viewKey, key, config.cache.views),

   /**
    * Add value only if it doesn't already exist (mainly for testing)
    */
   addIfMissing(key:string, buffer:Buffer|string) {
      return (config.cache.views)
         ? this.exists(key).then(exists => exists ? Promise.resolve() : this.add(key, buffer))
         : Promise.resolve();
   },

   /**
    * Remove cached page views
    */
   remove: (keys:string|string[]) => redis.remove(viewKey, keys),

   serialize: item.serialize
}

export default provider;