import { Cache } from '../types/';
import item from './item';
import redis from '../providers/redis';

//const viewKey = 'view';

/**
 * Add cache item to Redis
 */
function addItem(
   key: string,
   hashKey: string,
   value: string | GeoJSON.FeatureCollection<any>,
   enabled: boolean
): Promise<Cache.Item> {
   return item
      .create(hashKey, value)
      .then(
         item =>
            enabled ? redis.add(key, hashKey, item) : Promise.resolve(item)
      );
}

export function getItem<T>(key: string): Promise<T> {
   return redis.getObject<T>(key);
}

export function add(key: string, value: any): Promise<boolean> {
   return redis.add(key, value);
}

/**
 * Create a Redis-based cache provider.
 *
 * - `typeKey`: Hash key in which all cache items will be stored
 * - `enabled`: whether caching is enabled
 */
export function provide(hashKey: string, enabled: boolean): Cache.Provider {
   const exists = (key: string) =>
      enabled ? redis.exists(key, hashKey) : Promise.resolve(false);

   return {
      getItem: (key: string) =>
         redis.getObject(hashKey, key).then(item.deserialize),
      keys: () => redis.keys(hashKey),

      /**
       * Add or replace value at key
       */
      add: (key: string, text: string) => addItem(hashKey, key, text, enabled),

      create: item.create,

      /**
       * Whether cache key exists
       */
      exists,

      /**
       * Add value only if it doesn't already exist (mainly for testing)
       */
      addIfMissing(key: string, buffer: Buffer | string) {
         return enabled
            ? exists(key).then(
                 yep => (yep ? Promise.resolve(null) : this.add(key, buffer))
              )
            : Promise.resolve();
      },

      /**
       * Remove item at key
       */
      remove: (keys: string | string[]) => redis.remove(hashKey, keys),

      serialize: item.serialize
   };
}

export default { provide };
