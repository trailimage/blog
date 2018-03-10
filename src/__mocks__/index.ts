import * as fs from 'fs';
import * as path from 'path';
import * as Stream from 'stream';
import * as readline from 'readline';

export google from './google.mock';

const localPath = (name: string) => path.normalize(__dirname + '/' + name);

export const fontFile = 'test/pdf/droidsans.ttf';

/**
 * Technique that supports large text files
 */
export const loadBigFile = (name: string) => new Promise<string>(resolve => {
   const input = fs.createReadStream(localPath(name));
   const output: NodeJS.WritableStream = new Stream() as NodeJS.WritableStream;
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
