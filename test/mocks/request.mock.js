'use strict';

/** @mixin */
const fields = {
   referer: null,
   params: {},
   headers: {},
   connection: { remoteAddress: '' },
};
/** @mixes fields */
const methods = {
   get(field) { return this[field]; },
   header(name) { return this.headers[name];	},
   reset() {
      Object.assign(this, fields);
      return this;
   }
};

/** @type {MockRequest} */
module.exports = Object.assign(methods, fields);