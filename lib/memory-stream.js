'use strict';

const is = require('./is');
const C = require('./constants');
const stream = require('stream');

module.exports = class extends stream.Writable {
   /**
    * @param {Object} [options]
    */
   constructor(options) {
      super(options);
      this.content = new Buffer('');
   }

   /**
    * @param {Buffer|String} chunk
    * @param {String} [encoding]
    * @param {function} [callback]
    * @private
    */
   _write(chunk, encoding, callback) {
      const buffer = (Buffer.isBuffer(chunk)) ? chunk : Buffer.from(chunk, encoding);
      this.content = Buffer.concat([this.content, buffer]);
      if (is.callable(callback)) { callback(); }
   };

   toString() { return this.content.toString(C.encoding.UTF8); }
};