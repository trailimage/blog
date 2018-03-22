import { Cache } from '../types/';
import { is } from '@toba/tools';
import { encoding } from '../constants';
// http://nodejs.org/api/zlib.html
import * as compress from 'zlib';

/**
 * Create view cache item with eTag and compressed content
 */
export function create(
   key: string,
   htmlOrJSON: string | GeoJSON.FeatureCollection<any>
): Promise<Cache.Item> {
   return new Promise<Cache.Item>((resolve, reject) => {
      const text =
         typeof htmlOrJSON == is.Type.Object
            ? JSON.stringify(htmlOrJSON)
            : (htmlOrJSON as string);
      compress.gzip(Buffer.from(text), (err: Error, buffer: Buffer) => {
         if (is.value(err)) {
            reject(err);
         } else {
            resolve({
               buffer,
               eTag: key + '_' + new Date().getTime().toString()
            } as Cache.Item);
         }
      });
   });
}

/**
 * Convert cache item to string for storage
 */
export const serialize = (item: Cache.Item) =>
   JSON.stringify({
      buffer: item.buffer.toString(encoding.HEXADECIMAL),
      eTag: item.eTag
   });

export function deserialize(item: {
   buffer: string;
   eTag: string;
}): Cache.Item {
   return is.value(item)
      ? {
           buffer: Buffer.from(item.buffer, encoding.HEXADECIMAL),
           eTag: item.eTag
        }
      : null;
}

export default { create, serialize, deserialize };
