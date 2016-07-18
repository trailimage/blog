'use strict';

const is = require('./is');

// expected hash response used for validation and parsing
const dataType = {
   NONE: 0,            // don't check the reply
   OKAY: 1,            // check for 'OK'
   COUNT: 2,           // reply should match key count
   BIT: 3,             // 1 or 0
   RAW: 4,             // return raw data without validation or parsing
   JSON: 5             // parse as JSON
};

function howMany(key) { return is.array(key) ? key.length : 1; }

module.exports = {
   dataType,

   view: {
      item(key, buffer) {
         return {
            buffer: (typeof buffer === 'string') ? new Buffer(buffer, 'hex') : buffer,
            eTag: key + '_' + (new Date()).getTime().toString()
         };
      },

      // whether object is a view cache
      is(o) {
         return (is.value(o) && is.defined(o, 'buffer') && is.defined(o, 'eTag'));
      },

      serialize(v) {
         return JSON.stringify({	buffer: v.buffer.toString('hex'), eTag: v.eTag });
      }
   },

   // normalize cache provider response
   responder(key, callback, type) {
      return (err, reply) => {
         let error = this.hasError(key, err);

         if (is.callable(callback)) {
            let response = null;
            if (type === undefined) { type = dataType.NONE; }

            if (error) {
               if (type !== dataType.RAW && type !== dataType.JSON) { response = false; }
            } else {
               switch (type) {
                  case dataType.BIT: response = this.isTrue(reply); break;
                  case dataType.OKAY: response = this.isOkay(reply); break;
                  case dataType.COUNT: response = (reply == howMany(key)); break;
                  case dataType.RAW: response = reply; break;
                  case dataType.JSON: response = this.parseObject(reply); break;
                  case dataType.NONE: response = true; break;
               }
            }
            callback(response);
         }
      }
   }
};