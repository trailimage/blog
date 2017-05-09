const fs = require('fs');
const path = require('path');
const stream = require('stream');
const readline = require('readline');
const google = require('./google.mock');

const localPath = name => path.normalize(__dirname + '/' + name);

// http://www.lipsum.com/
module.exports = {
   lipsum: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
   fontFile: 'test/pdf/droidsans.ttf',
   google,

   /**
    * Technique that supports large text files
    * @param {string} name
    * @returns {Promise.<string>} File content
    */
   loadBigFile(name) {
      return new Promise(resolve => {
         const input = fs.createReadStream(localPath(name));
         const output = new stream();
         const rl = readline.createInterface(input, output);
         let file = '';
         rl.on('line', line => file += line + nl);
         rl.on('close', ()=> resolve(file));
      });
   },

   /**
    * @param {string} name
    * @returns {Promise<Buffer>} File content
    */
   loadFile(name) {
      return new Promise((resolve, reject) => {
         fs.readFile(localPath(name), (err, data) => {
            if (err === null) {
               resolve(data);
            } else {
               reject(err);
            }
         });
      });
   },

   /**
    * @param {string} name
    * @returns {ReadStream}
    */
   loadStream(name) {
      return fs.createReadStream(localPath(name));
   }
};