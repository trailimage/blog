'use strict';

const fs = require('fs');
const is = require('../../lib/is.js');

let tokenExpired = false;

module.exports = {
   expireToken() { tokenExpired = true; },
   auth: {
      //url: authorizationURL,
      //client: authClient,
      verify: () => {},
      expired: () => tokenExpired
   },
   drive: {
      /**
       * @param {Post} post
       * @param {Stream.Writable} [stream]
       * @returns {Promise}
       */
      loadGPX: (post, stream) => new Promise((resolve, reject) => {
         fs.readFile(__dirname + '/track-big.gpx', (err, data) => {
            if (is.value(err)) {
               reject(err)
            } else {
               resolve(data);
            }
         })
      })
   }
};