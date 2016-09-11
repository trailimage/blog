'use strict';

/** @type {MockRequest} */
module.exports = {
   referer: null,
   params: {},
   headers: {},
   connection: { remoteAddress: '' },
   get(field) { return this[field]; },
   header(name) { return this.headers[name];	},
   reset() {
      this.referer = null;
      this.params = {};
      this.headers = {};
      this.connection = { remoteAddress: '' };
      return this;
   }
};