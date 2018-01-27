import { Cache } from '../types/';
import config from '../config';
import item from './item';
import is from '../is';

const memory: { [key: string]: Cache.Item } = {};

const provider: Cache.Provider = {
   getItem: (key: string) => Promise.resolve(memory[key]),
   keys: () => Promise.resolve(Object.keys(memory)),

   /**
    * Add or replace value at key
    */
   add: (key: string, value: any) =>
      item.create(key, value).then(item => {
         if (config.cache.views) {
            memory[key] = item;
         }
         return Promise.resolve(item);
      }),

   create: item.create,

   /**
    * Whether cache view exists
    */
   exists: (key: string) => Promise.resolve(is.defined(memory, key)),

   /**
    * Add value only if it doesn't already exist (mainly for testing)
    */
   addIfMissing(key: string, buffer: string | Buffer): Promise<any> {
      return config.cache.views
         ? provider
              .exists(key)
              .then(
                 exists =>
                    exists ? Promise.resolve(null) : this.add(key, buffer)
              )
         : Promise.resolve();
   },

   /**
    * Remove cached page views
    */
   remove: (keys: string | string[]) => {
      if (is.array(keys)) {
         keys.forEach(k => delete memory[k]);
      } else {
         delete memory[keys];
      }
      return Promise.resolve();
   },

   /**
    * In-memory cache doesn't need to serialize the page buffer
    */
   serialize: (item: Cache.Item) => item
};

export default provider;
