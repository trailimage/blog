import { Cache, Flickr } from '../types';
import is from '../is';
import redis from '../providers/redis';

const prefix = 'api:';

const provider = {
   getItem<T>(key:string, hashKey:string) {
      return redis.getObject<T>(prefix + key, hashKey)
   },

   add: (key:string, hashKeyOrValue:any, value?:any) =>
      redis.add(prefix + key, hashKeyOrValue, value),

   /**
    * All keys with standard prefix
    */
   keys: ()=> redis.keys(prefix + '*'),

   remove: (key:string|string[], hashKey?:string|string[]) => redis.remove(
      is.array(key) ? key.map(k => prefix + k) : prefix + key,
      hashKey
   )
}

export default provider;