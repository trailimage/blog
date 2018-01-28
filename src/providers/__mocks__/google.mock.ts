import * as fs from 'fs';
import is from '../../is';
import { Token } from '../google';
import { encoding } from '../../constants';
import { Provider, Post } from '../../types';

let tokenExpired = false;

const google = jest.genMockFromModule('../google') as Provider.Google;

google.auth = {
   //url: authorizationURL,
   //client: authClient,
   verify: () => true,
   expired: () => tokenExpired,
   getAccessToken: (): Promise<Token> => null,
   isEmpty: () => false
};

google.drive = {
   loadGPX: (_post: Post, stream: NodeJS.WriteStream) =>
      new Promise((resolve, reject) => {
         fs.readFile(__dirname + '/track-big.gpx', (err, data) => {
            if (is.value(err)) {
               reject(err);
            } else {
               if (is.value(stream)) {
                  stream.write(body);
               }
               resolve(data.toString(encoding.UTF8));
            }
         });
      });

//google.__expireToken = () => { tokenExpired = true; }

export default google;
