import * as fs from 'fs';
import is from '../is';
import C from '../constants';
import { Post } from '../types';

let tokenExpired = false;

export namespace google {
   export const expireToken = () => {
      tokenExpired = true;
   };

   export const auth = {
      //url: authorizationURL,
      //client: authClient,
      verify: () => true,
      expired: () => tokenExpired
   };

   export const drive = {
      loadGPX: (_post: Post, stream: NodeJS.WriteStream) =>
         new Promise((resolve, reject) => {
            fs.readFile(__dirname + '/track-big.gpx', (err, data) => {
               if (is.value(err)) {
                  reject(err);
               } else {
                  if (is.value(stream)) {
                     stream.write(body);
                  }
                  resolve(data.toString(C.encoding.UTF8));
               }
            });
         })
   };
}
