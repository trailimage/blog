import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';
import * as readline from 'readline';

export google from './google.mock';

const localPath = (name: string) => path.normalize(__dirname + '/' + name);

/** http://www.lipsum.com/ */
export const lipsum =
   'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
export const fontFile = 'test/pdf/droidsans.ttf';

/**
 * Technique that supports large text files
 */
export const loadBigFile = (name: string) => new Promise(resolve => {
   const input = fs.createReadStream(localPath(name));
   const output = new stream();
   const rl = readline.createInterface(input, output);
   let file = '';
   rl.on('line', line => (file += line + nl));
   rl.on('close', () => resolve(file));
});

export const loadFile = (name: string) =>
   new Promise((resolve, reject) => {
      fs.readFile(localPath(name), (err, data) => {
         if (err === null) {
            resolve(data);
         } else {
            reject(err);
         }
      });
   });

export const loadStream = (name: string) =>
  fs.createReadStream(localPath(name));
