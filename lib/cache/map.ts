import { Cache } from '../types';
import config from '../config';
import item from './item';
import redis from '../providers/redis';

const mapKey = 'map';

const provider:Cache.Provider = {
   getItem: (key:string) => redis.getObject(mapKey, key).then(item.deserialize),
   keys: ()=> redis.keys(mapKey),

   /**
    * Add or replace value at key
    */
   add: (key:string, geoJSON:GeoJSON.FeatureCollection<any>) => addItem(mapKey, key, geoJSON, config.cache.maps),

   /**
    * Whether cache map exists
    */
   exists: (key:string) => exists(mapKey, key, config.cache.maps),

   /**
    * Remove cached GeoJSON
    */
   remove: (key:string|string[]) => redis.remove(mapKey, key),

   /**
    * Add value only if it doesn't already exist (mainly for testing)
    */
   addIfMissing(key:string, buffer:Buffer|string) {
      return (config.cache.maps)
         ? provider.exists(key).then(exists => exists ? Promise.resolve() : this.add(key, buffer))
         : Promise.resolve();
   },

   serialize: item.serialize
};

export default provider;