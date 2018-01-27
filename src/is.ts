import { Cache } from './types/';
import { is } from '@toba/utility';

function cacheItem(o: any): o is Cache.Item {
   return (
      is.value<Object>(o) &&
      o['buffer'] !== undefined &&
      o['eTag'] !== undefined
   );
}

export default {
   ...is,
   cacheItem,
   xml(v: any) {
      return this.text(v) && /^<\?xml version="[\d\.]+"/.test(v);
   }
};
